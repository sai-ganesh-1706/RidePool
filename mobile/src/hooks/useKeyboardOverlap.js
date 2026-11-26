import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

const SHOW = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

/**
 * Measures how many pixels of the referenced view are actually covered by the keyboard.
 *
 * `KeyboardAvoidingView` guesses this from the view's position inside its parent, which is wrong
 * under a navigation header and on edge-to-edge Android (the window no longer resizes for the keyboard).
 * Measuring the view in window coordinates is exact everywhere – and returns 0 when the OS already
 * resized the window, so nothing is ever double-counted.
 *
 * Returns `{ visible, overlap }` – apply `overlap` as bottom padding.
 */
export default function useKeyboardOverlap(viewRef) {
  const [state, setState] = useState({ visible: false, overlap: 0 });

  useEffect(() => {
    const show = Keyboard.addListener(SHOW, (event) => {
      const keyboardTop = event.endCoordinates.screenY;
      const fallback = () => setState({ visible: true, overlap: event.endCoordinates.height });
      const node = viewRef.current;
      if (!node?.measureInWindow) return fallback();
      node.measureInWindow((_x, y, _w, height) => {
        if (!height) return fallback();
        setState({ visible: true, overlap: Math.max(0, Math.round(y + height - keyboardTop)) });
      });
    });
    const hide = Keyboard.addListener(HIDE, () => setState({ visible: false, overlap: 0 }));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [viewRef]);

  return state;
}
