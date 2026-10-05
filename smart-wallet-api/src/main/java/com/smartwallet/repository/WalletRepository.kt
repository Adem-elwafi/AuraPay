// kotlin
package com.smartwallet.repository

import com.smartwallet.model.Wallet
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface WalletRepository : JpaRepository<Wallet, Long> {
    /**
     * Trouve le portefeuille associé à un utilisateur spécifique.
     * @param userId L'ID de l'utilisateur
     * @return Un Optional contenant le portefeuille s'il existe
     */
    fun findByUserId(userId: Long): Optional<Wallet>

    /**
     * Optionnel : Trouve un portefeuille par son numéro de compte unique.
     */
    fun findByAccountNumber(accountNumber: String): Optional<Wallet>

    /**
     * Charge le portefeuille d'un utilisateur avec un verrou en écriture (SELECT ... FOR UPDATE)
     * pour éviter les mises à jour perdues lors d'opérations concurrentes sur le solde.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.user.id = :userId")
    fun findByUserIdForUpdate(@Param("userId") userId: Long): Optional<Wallet>

    /**
     * Charge un portefeuille par son ID avec un verrou en écriture.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.id = :id")
    fun findByIdForUpdate(@Param("id") id: Long): Optional<Wallet>

    /**
     * Récupère uniquement l'ID du portefeuille (sans charger l'entité), utilisé pour ordonner les verrous.
     */
    @Query("SELECT w.id FROM Wallet w WHERE w.user.id = :userId")
    fun findIdByUserId(@Param("userId") userId: Long): Optional<Long>

    @Query("SELECT w.id FROM Wallet w WHERE w.accountNumber = :accountNumber")
    fun findIdByAccountNumber(@Param("accountNumber") accountNumber: String): Optional<Long>
}
