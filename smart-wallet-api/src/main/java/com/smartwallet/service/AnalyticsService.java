package com.smartwallet.service;

import com.smartwallet.dto.ChartDataPoint;
import com.smartwallet.dto.DashboardStatsResponse;
import com.smartwallet.model.Transaction;
import com.smartwallet.model.Transaction.TransactionType;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private static final double DEFAULT_TREND = 100.0d;
    private static final DateTimeFormatter CHART_LABEL_FORMATTER = DateTimeFormatter.ofPattern("dd MMM", Locale.FRENCH);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public DashboardStatsResponse getDashboardStats(String username) {
        Wallet wallet = getWalletForUsername(username);
        List<Transaction> transactions = transactionRepository.findAllByWalletId(wallet.getId());

        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);

        LocalDateTime currentStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime currentEnd = currentMonth.plusMonths(1).atDay(1).atStartOfDay();
        LocalDateTime previousStart = previousMonth.atDay(1).atStartOfDay();
        LocalDateTime previousEnd = currentStart;

        BigDecimal currentRevenues = sumTransactions(transactions, wallet.getId(), currentStart, currentEnd, true);
        BigDecimal currentExpenses = sumTransactions(transactions, wallet.getId(), currentStart, currentEnd, false);
        BigDecimal currentSavings = currentRevenues.subtract(currentExpenses);

        BigDecimal previousRevenues = sumTransactions(transactions, wallet.getId(), previousStart, previousEnd, true);
        BigDecimal previousExpenses = sumTransactions(transactions, wallet.getId(), previousStart, previousEnd, false);
        BigDecimal previousSavings = previousRevenues.subtract(previousExpenses);

        return new DashboardStatsResponse(
                currentRevenues,
                currentExpenses,
                currentSavings,
                calculateTrend(currentRevenues, previousRevenues),
                calculateTrend(currentExpenses, previousExpenses),
                calculateTrend(currentSavings, previousSavings)
        );
    }

    public List<ChartDataPoint> getChartData(String username) {
        Wallet wallet = getWalletForUsername(username);
        List<Transaction> transactions = transactionRepository.findAllByWalletId(wallet.getId());

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(29);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        Map<LocalDate, BigDecimal> dailyNetChanges = new LinkedHashMap<>();
        LocalDate cursor = startDate;
        while (!cursor.isAfter(endDate)) {
            dailyNetChanges.put(cursor, BigDecimal.ZERO);
            cursor = cursor.plusDays(1);
        }

        BigDecimal netSinceStart = BigDecimal.ZERO;
        for (Transaction transaction : transactions) {
            LocalDateTime timestamp = transaction.getTimestamp();
            if (timestamp == null || timestamp.isBefore(startDateTime) || !timestamp.isBefore(endDateTime)) {
                continue;
            }

            LocalDate transactionDate = timestamp.toLocalDate();
            BigDecimal signedAmount = signedAmount(transaction, wallet.getId());
            dailyNetChanges.computeIfPresent(transactionDate, (date, current) -> current.add(signedAmount));
            netSinceStart = netSinceStart.add(signedAmount);
        }

        BigDecimal openingBalance = safeAmount(wallet.getBalance()).subtract(netSinceStart);
        BigDecimal runningBalance = openingBalance;
        List<ChartDataPoint> points = new ArrayList<>(dailyNetChanges.size());

        for (Map.Entry<LocalDate, BigDecimal> entry : dailyNetChanges.entrySet()) {
            runningBalance = runningBalance.add(entry.getValue());
            points.add(new ChartDataPoint(formatLabel(entry.getKey()), runningBalance));
        }

        return points;
    }

    private Wallet getWalletForUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Wallet not found for this user"));
    }

    private BigDecimal sumTransactions(List<Transaction> transactions, Long walletId, LocalDateTime start, LocalDateTime end, boolean revenues) {
        BigDecimal total = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            LocalDateTime timestamp = transaction.getTimestamp();
            if (timestamp == null || timestamp.isBefore(start) || !timestamp.isBefore(end)) {
                continue;
            }

            if (isIncoming(transaction, walletId) == revenues) {
                total = total.add(safeAmount(transaction.getAmount()));
            }
        }

        return total;
    }

    /**
     * Un virement n'est stocké qu'une fois (type DEBIT, côté expéditeur) : le sens doit donc
     * être déterminé par rapport au wallet consulté, et non par le seul type ou la catégorie.
     * - dépôt : sender == receiver == wallet, type CREDIT → entrée
     * - virement reçu : receiver == wallet, sender != wallet → entrée
     * - virement envoyé / dépense : sender == wallet → sortie
     */
    private boolean isIncoming(Transaction transaction, Long walletId) {
        Wallet receiver = transaction.getReceiverWallet();
        if (receiver == null || !walletId.equals(receiver.getId())) {
            return false;
        }

        Wallet sender = transaction.getSenderWallet();
        boolean selfReferenced = sender != null && walletId.equals(sender.getId());
        return !selfReferenced || transaction.getType() == TransactionType.CREDIT;
    }

    private BigDecimal signedAmount(Transaction transaction, Long walletId) {
        BigDecimal amount = safeAmount(transaction.getAmount());
        return isIncoming(transaction, walletId) ? amount : amount.negate();
    }

    private BigDecimal safeAmount(BigDecimal amount) {
        return amount != null ? amount : BigDecimal.ZERO;
    }

    private double calculateTrend(BigDecimal current, BigDecimal previous) {
        BigDecimal previousValue = safeAmount(previous);
        BigDecimal currentValue = safeAmount(current);

        if (previousValue.compareTo(BigDecimal.ZERO) == 0) {
            return currentValue.signum() * DEFAULT_TREND;
        }

        BigDecimal change = currentValue.subtract(previousValue);
        return change
                .divide(previousValue.abs(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private String formatLabel(LocalDate date) {
        String formatted = date.format(CHART_LABEL_FORMATTER);
        String[] parts = formatted.split(" ");

        if (parts.length < 2 || parts[1].isEmpty()) {
            return formatted;
        }

        return parts[0] + " " + parts[1].substring(0, 1).toUpperCase(Locale.FRENCH) + parts[1].substring(1);
    }
}