/** Bind browser listeners to a Vue component’s lifetime so sidebar navigation releases them. */
import { onMounted, onUnmounted } from 'vue';

/** Receive extension-host events only while the owning component is mounted. */
export function useHostMessages (handler: (event: MessageEvent) => void) {
    onMounted(() => window.addEventListener('message', handler));
    onUnmounted(() => window.removeEventListener('message', handler));
}

/** Own document click/keyboard listeners used by sidebar menus. */
export function useDocumentEvent (name: string, handler: EventListener) {
    onMounted(() => document.addEventListener(name, handler));
    onUnmounted(() => document.removeEventListener(name, handler));
}
