import { Client } from '@stomp/stompjs';
import type { IFrame } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import type { Wallet } from '../api/types';

interface UseWebSocketOptions {
  enabled: boolean;
  username?: string;
  token?: string;
  onWalletUpdate: (wallet: Wallet) => void;
}

// Relatif : passe par le proxy Vite (/ws -> http://localhost:8081/ws), même origine que l'API REST
const SOCKET_URL = import.meta.env.VITE_WS_URL ?? '/ws';

export const useWebSocket = ({ enabled, username, token, onWalletUpdate }: UseWebSocketOptions) => {
  const lastWalletData = useRef<string>('');

  // Le callback est conservé dans une ref : sinon chaque rendu du parent recréerait la connexion STOMP
  const onWalletUpdateRef = useRef(onWalletUpdate);
  useEffect(() => {
    onWalletUpdateRef.current = onWalletUpdate;
  }, [onWalletUpdate]);

  useEffect(() => {
    if (!enabled || !username || !token || token === 'sw-demo-session') {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('STOMP: ' + str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame: IFrame) => {
      console.log('Connected to STOMP: ' + frame.body);

      const topic = `/topic/wallet/${username}`;
      client.subscribe(topic, (message) => {
        if (message.body) {
          try {
            const newWallet: Wallet = JSON.parse(message.body);
            const stringifiedData = JSON.stringify(newWallet);

            // Prévention de l'Update Storm : On ne met à jour que si les données ont réellement changé
            if (stringifiedData !== lastWalletData.current) {
              lastWalletData.current = stringifiedData;
              onWalletUpdateRef.current(newWallet);
              console.log('Real-time wallet update received:', newWallet);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
    };

    client.activate();

    return () => {
      console.log('Cleaning up WebSocket connection...');
      void client.deactivate();
      lastWalletData.current = '';
    };
  }, [enabled, username, token]);
};
