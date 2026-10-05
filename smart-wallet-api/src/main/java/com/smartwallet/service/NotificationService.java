package com.smartwallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Envoie une mise à jour du solde du wallet à l'utilisateur spécifié en temps réel.
     * Si appelé dans une transaction, l'envoi est différé après le commit pour ne jamais
     * diffuser un solde qui serait ensuite annulé par un rollback.
     * @param username Le nom d'utilisateur destinataire
     * @param balancePayload L'objet contenant les informations de mise à jour (solde, etc.)
     */
    public void sendWalletUpdate(String username, Object balancePayload) {
        String destination = "/topic/wallet/" + username;

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    messagingTemplate.convertAndSend(destination, balancePayload);
                }
            });
            return;
        }

        messagingTemplate.convertAndSend(destination, balancePayload);
    }
}
