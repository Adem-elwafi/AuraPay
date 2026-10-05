package com.smartwallet.service;

import com.smartwallet.dto.TransactionResponse;
import com.smartwallet.exception.InsufficientBalanceException;
import com.smartwallet.model.TransactionCategory;
import com.smartwallet.dto.TransferRequest;
import com.smartwallet.dto.WalletResponse;
import com.smartwallet.model.Transaction;
import com.smartwallet.model.User;
import com.smartwallet.model.Wallet;
import com.smartwallet.repository.TransactionRepository;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private static final String PREFIX = "SW-";
    private static final SecureRandom random = new SecureRandom();
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Wallet createWalletForUser(User user) {
        Wallet wallet = Wallet.builder()
                .accountNumber(generateUniqueAccountNumber())
                .balance(BigDecimal.ZERO)
                .currency("TND")
                .user(user)
                .build();

        return walletRepository.save(wallet);
    }

    private String generateUniqueAccountNumber() {
        String accountNumber;
        do {
            StringBuilder sb = new StringBuilder(PREFIX);
            for (int i = 0; i < 10; i++) {
                sb.append(random.nextInt(10));
            }
            accountNumber = sb.toString();
        } while (walletRepository.findByAccountNumber(accountNumber).isPresent());

        return accountNumber;
    }

    public WalletResponse getWalletByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found for this user"));

        return new WalletResponse(
                wallet.getAccountNumber(),
                wallet.getBalance(),
                wallet.getCurrency()
        );
    }

    /**
     * Effectue un virement atomique d'un compte à un autre
     * @param senderUsername L'utilisateur effectuant le virement
     * @param transferRequest Les détails du virement
     * @return La transaction créée
     * @throws IllegalArgumentException si le montant est invalide, le compte destinataire n'existe pas, ou le virement est vers soi-même
     * @throws InsufficientBalanceException si le solde est insuffisant
     */
    @Transactional
    public TransactionResponse transfer(String senderUsername, TransferRequest transferRequest) {
        BigDecimal amount = transferRequest.amount();
        validateAmount(amount, "Transfer");

        String recipientAccountNumber = transferRequest.recipientAccountNumber();
        if (recipientAccountNumber == null || recipientAccountNumber.isBlank()) {
            throw new IllegalArgumentException("Recipient account number is required");
        }

        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Sender user not found"));

        Long senderWalletId = walletRepository.findIdByUserId(sender.getId())
                .orElseThrow(() -> new RuntimeException("Sender wallet not found"));
        Long receiverWalletId = walletRepository.findIdByAccountNumber(recipientAccountNumber.trim())
                .orElseThrow(() -> new IllegalArgumentException("Recipient account not found"));

        // Vérifier que l'expéditeur ne s'envoie pas d'argent à lui-même
        if (senderWalletId.equals(receiverWalletId)) {
            throw new IllegalArgumentException("Cannot transfer money to the same account");
        }

        // Verrouiller les deux wallets toujours dans le même ordre (ID croissant) pour éviter les deadlocks
        Wallet first = lockWallet(Math.min(senderWalletId, receiverWalletId));
        Wallet second = lockWallet(Math.max(senderWalletId, receiverWalletId));
        Wallet senderWallet = first.getId().equals(senderWalletId) ? first : second;
        Wallet receiverWallet = first.getId().equals(senderWalletId) ? second : first;

        // Vérifier que le solde est suffisant
        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        // Effectuer le transfert : débiter l'expéditeur et créditer le destinataire
        senderWallet.setBalance(senderWallet.getBalance().subtract(amount));
        receiverWallet.setBalance(receiverWallet.getBalance().add(amount));

        // Sauvegarder les wallets
        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        // Une seule ligne est enregistrée : DEBIT du point de vue de l'expéditeur ;
        // le destinataire la lit comme un crédit (receiverWallet == son wallet)
        Transaction senderTransaction = Transaction.builder()
                .amount(amount)
                .timestamp(LocalDateTime.now())
                .type(Transaction.TransactionType.DEBIT)
                .category(TransactionCategory.AUTRE)
                .description(transferRequest.description())
                .senderWallet(senderWallet)
                .receiverWallet(receiverWallet)
                .build();

        Transaction savedTransaction = transactionRepository.save(senderTransaction);

        // Notifier l'expéditeur et le destinataire du nouveau solde via WebSocket
        notificationService.sendWalletUpdate(senderUsername, new WalletResponse(senderWallet.getAccountNumber(), senderWallet.getBalance(), senderWallet.getCurrency()));
        notificationService.sendWalletUpdate(receiverWallet.getUser().getUsername(), new WalletResponse(receiverWallet.getAccountNumber(), receiverWallet.getBalance(), receiverWallet.getCurrency()));

        return TransactionResponse.fromEntity(savedTransaction);
    }

    @Transactional
    public TransactionResponse createExpense(String username, BigDecimal amount, TransactionCategory category, String description) {
        validateAmount(amount, "Expense");

        if (category == null) {
            throw new IllegalArgumentException("Expense category is required");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found for this user"));

        // Dépenses personnelles : enregistrement possible même si le solde virtuel est insuffisant/nul
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        Transaction expenseTransaction = Transaction.builder()
                .amount(amount)
                .timestamp(LocalDateTime.now())
                .type(Transaction.TransactionType.DEBIT)
                .category(category)
                .description(description)
                .senderWallet(wallet)
                .receiverWallet(null)
                .build();

        Transaction savedExpense = transactionRepository.save(expenseTransaction);

        // Notifier l'utilisateur de la mise à jour de son solde
        notificationService.sendWalletUpdate(username, new WalletResponse(wallet.getAccountNumber(), wallet.getBalance(), wallet.getCurrency()));

        return TransactionResponse.fromEntity(savedExpense);
    }

    @Transactional
    public TransactionResponse deposit(String username, BigDecimal amount) {
        validateAmount(amount, "Deposit");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found for this user"));

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        Transaction depositTransaction = Transaction.builder()
                .amount(amount)
                .timestamp(LocalDateTime.now())
                .type(Transaction.TransactionType.CREDIT)
                .category(TransactionCategory.REVENUS)
                .description("Dépôt d'argent (Top-up)")
                .senderWallet(wallet) // Auto-référence pour éviter NULL
                .receiverWallet(wallet)
                .build();

        Transaction savedDeposit = transactionRepository.save(depositTransaction);

        // Notifier l'utilisateur de la mise à jour de son solde
        notificationService.sendWalletUpdate(username, new WalletResponse(wallet.getAccountNumber(), wallet.getBalance(), wallet.getCurrency()));

        return TransactionResponse.fromEntity(savedDeposit);
    }

    private Wallet lockWallet(Long walletId) {
        return walletRepository.findByIdForUpdate(walletId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));
    }

    /**
     * Le montant doit être strictement positif et avoir au plus 3 décimales
     * (pour supporter les millimes tunisiens TND).
     */
    private void validateAmount(BigDecimal amount, String operation) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(operation + " amount must be greater than zero");
        }
        if (amount.stripTrailingZeros().scale() > 3) {
            throw new IllegalArgumentException(operation + " amount cannot have more than 3 decimal places");
        }
    }

}