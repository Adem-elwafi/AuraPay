package com.smartwallet.controller;

import com.smartwallet.dto.ExpenseRequest;
import com.smartwallet.dto.DepositRequest;
import com.smartwallet.dto.TransactionResponse;
import com.smartwallet.dto.TransferRequest;
import com.smartwallet.exception.InsufficientBalanceException;
import com.smartwallet.model.Wallet;
import com.smartwallet.repository.TransactionRepository;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.repository.WalletRepository;
import com.smartwallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final WalletService walletService;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    /**
     * Initie un virement d'argent d'un compte à un autre
     */
    @PostMapping("/transfer")
    public ResponseEntity<?> initiateTransfer(
            Authentication authentication,
            @RequestBody TransferRequest transferRequest) {
        try {
            TransactionResponse response = walletService.transfer(
                    authentication.getName(),
                    transferRequest
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (InsufficientBalanceException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Transfer failed: " + e.getMessage()));
        }
    }

    /**
     * Récupère l'historique des transactions de l'utilisateur connecté
     */
    @GetMapping("/history")
    public ResponseEntity<?> getTransactionHistory(Authentication authentication) {
        try {
            // Récupérer l'utilisateur par son username (email)
            var user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // Récupérer le wallet de l'utilisateur
            Wallet userWallet = walletRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            // Récupérer les transactions
            List<TransactionResponse> transactions = transactionRepository
                    .findAllByWalletId(userWallet.getId())
                    .stream()
                    .map(TransactionResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(transactions);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to retrieve transactions: " + e.getMessage()));
        }
    }

    /**
     * Enregistre une dépense catégorisée pour l'utilisateur connecté
     */
    @PostMapping("/expense")
    public ResponseEntity<?> createExpense(Authentication authentication, @RequestBody ExpenseRequest expenseRequest) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Unauthorized"));
            }

            TransactionResponse response = walletService.createExpense(
                    authentication.getName(),
                    expenseRequest.amount(),
                    expenseRequest.category(),
                    expenseRequest.description()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (InsufficientBalanceException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Expense creation failed: " + e.getMessage()));
        }
    }

    /**
     * Effectue un dépôt sur le wallet de l'utilisateur connecté
     */
    @PostMapping("/deposit")
    public ResponseEntity<?> createDeposit(Authentication authentication, @RequestBody DepositRequest depositRequest) {
        try {
            TransactionResponse response = walletService.deposit(
                    authentication.getName(),
                    depositRequest.amount()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Deposit failed: " + e.getMessage()));
        }
    }

    /**
     * DTO interne pour les réponses d'erreur
     */
    private static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}
