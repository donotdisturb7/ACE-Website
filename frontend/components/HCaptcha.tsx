'use client';

import { useEffect, useRef } from 'react';

interface HCaptchaProps {
  sitekey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    hcaptcha: any;
  }
}

/**
 * Composant hCaptcha pour Next.js
 * Utilise l'API JavaScript de hCaptcha directement (pas de package tiers)
 */
export default function HCaptcha({ sitekey, onVerify, onError, onExpire }: HCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onError, onExpire });

  // Mettre à jour les callbacks sans déclencher de re-render
  useEffect(() => {
    callbacksRef.current = { onVerify, onError, onExpire };
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    const renderCaptcha = () => {
      if (containerRef.current && window.hcaptcha && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
            sitekey,
            callback: (token: string) => callbacksRef.current.onVerify(token),
            'error-callback': () => callbacksRef.current.onError?.(),
            'expired-callback': () => callbacksRef.current.onExpire?.(),
          });
        } catch (e) {
          console.error('HCaptcha render error:', e);
        }
      }
    };

    // Vérifier si le script est déjà chargé
    if (window.hcaptcha) {
      renderCaptcha();
      return;
    }

    // Vérifier si le script est déjà en cours de chargement
    const existingScript = document.querySelector('script[src="https://js.hcaptcha.com/1/api.js"]');
    if (existingScript) {
      // Script déjà ajouté, attendre qu'il charge
      existingScript.addEventListener('load', renderCaptcha);
      return () => {
        existingScript.removeEventListener('load', renderCaptcha);
        if (widgetIdRef.current && window.hcaptcha) {
          try {
            window.hcaptcha.remove(widgetIdRef.current);
          } catch (e) {
            // Ignore
          }
          widgetIdRef.current = null;
        }
      };
    }

    // Charger le script hCaptcha une seule fois
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderCaptcha);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', renderCaptcha);
      // Nettoyer le widget à la destruction du composant
      if (widgetIdRef.current && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore les erreurs de cleanup
        }
        widgetIdRef.current = null;
      }
    };
  }, [sitekey]);

  return <div ref={containerRef} className="h-captcha" />;
}
