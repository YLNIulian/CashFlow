// hooks.jsx - hook-urile mele custom plus componenta de toast-uri
// useToast          - gestioneaza notificarile de tip toast (succes, eroare, warning)
// useAnimatedNumber - animeaza un numar de la valoarea veche la cea noua
// useScrollReveal   - face elementele sa apara frumos cand intri cu scroll pe ele
// ToastContainer    - componenta care afiseaza vizual toast-urile pe ecran

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckIcon, AlertIcon, SparkIcon } from './icons.jsx';

// ---- ToastContainer ----
// afisez lista de notificari in coltul de jos al ecranului
// fiecare toast dispare singur dupa cateva secunde (setez eu durata in useToast)

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast toast-${toast.type}`}
          onClick={() => onDismiss(toast.id)}
        >
          <span className="toast-icon">
            {toast.type === 'success' && <CheckIcon size={13} />}
            {toast.type === 'warning' && <AlertIcon size={13} />}
            {toast.type === 'error' && '×'}
            {toast.type === 'info' && <SparkIcon size={13} />}
          </span>
          <span className="toast-msg">{toast.message}</span>
        </button>
      ))}
    </div>
  );
}

// ---- useToast ----
// hook pe care il folosesc in App.jsx pentru a adauga/sterge toast-uri
// addToast(mesaj, tip, durata) - adauga un toast si il sterge automat dupa N ms

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3400) => {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((previous) => [...previous, { id, message, type }]);

    // sterg toast-ul automat dupa durata specificata
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  // stergere manuala la click pe toast
  const dismissToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}

// ---- useAnimatedNumber ----
// animeaza un numar de la valoarea curenta la target
// am folosit easing cubic (1 - (1-t)^3) ca sa para mai natural

export function useAnimatedNumber(target, duration = 1000) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const start = performance.now();
    const from = value;
    const distance = target - from;

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(from + distance * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

// ---- useScrollReveal ----
// folosesc IntersectionObserver ca sa adaug clasa 'visible' elementelor
// cand ajung in viewport - CSS-ul se ocupa de animatia propriu-zisa
// in fiecare pagina pun ref-ul pe container si clasa .scroll-reveal pe sectiuni

export function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return ref;
}
