import { Client } from '@stomp/stompjs';
import type { IFrame } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import type SockJS from 'sockjs-client';
import type { Wallet } from '../api/types';
import { isLocalToken } from '../lib/localAuth';

interface UseWebSocketOptions {
  enabled: boolean;
  username?: string;
  token?: string;
  onWalletUpdate: (wallet: Wallet) => void;
}

const EXPLICIT_WS_URL = (import.meta.env.VITE_WS_URL as string | undefined)?.trim() || undefined;

// Relatif : passe par le proxy Vite (/ws -> http://localhost:8081/ws), même origine que l'API REST
const SOCKET_URL = EXPLICIT_WS_URL ?? '/ws';

const isLocalHost = () =>
  typeof window !== 'undefined' && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

/**
 * STOMP/SockJS uniquement si un serveur WebSocket existe : URL explicite (VITE_WS_URL) ou Spring Boot en local.
 * Sur un hébergement statique (Vercel), SockJS échouerait en boucle et son écouteur `unload`
 * déclencherait des violations de Permissions Policy.
 */
export const isWebSocketAvailable = () => Boolean(EXPLICIT_WS_URL) || isLocalHost();

export const useWebSocket = ({ enabled, username, token, onWalletUpdate }: UseWebSocketOptions) => {
  const lastWalletData = useRef<string>('');

  // Le callback est conservé dans une ref : sinon chaque rendu du parent recréerait la connexion STOMP
  const onWalletUpdateRef = useRef(onWalletUpdate);
  useEffect(() => {
    onWalletUpdateRef.current = onWalletUpdate;
  }, [onWalletUpdate]);

  useEffect(() => {
    if (!enabled || !username || !token || token === 'sw-demo-session' || isLocalToken(token) || !isWebSocketAvailable()) {
      return;
    }

    let cancelled = false;
    let SockJSImpl: typeof SockJS | null = null;

    const client = new Client({
      webSocketFactory: () => new SockJSImpl!(SOCKET_URL),
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

    // Import dynamique : sockjs-client enregistre un écouteur `unload` dès son chargement,
    // il ne doit donc être chargé que si un serveur WebSocket existe réellement.
    void import('sockjs-client')
      .then(({ default: SockJSModule }) => {
        if (cancelled) return;
        SockJSImpl = SockJSModule;
        client.activate();
      })
      .catch((error) => console.warn('Chargement de SockJS impossible :', error));

    return () => {
      cancelled = true;
      console.log('Cleaning up WebSocket connection...');
      void client.deactivate();
      lastWalletData.current = '';
    };
  }, [enabled, username, token]);
};
