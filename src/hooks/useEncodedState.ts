import { useEffect, useMemo, useState } from "react";
import { utoa, atou } from "../utils/utils";
import type { Dispatch, SetStateAction } from "react";

/**
 * Hook to manage encoded state in URL hash
 * @param initialValue - Initial value if hash is empty
 * @returns [decodedValue, setDecodedValue, encodedHash] - decoded value, setter, and current encoded hash
 */
export function useEncodedState(initialValue: string = ""): [string, Dispatch<SetStateAction<string>>, string] {
  const [hash, setHash] = useLocationHashState();

  // Decode hash to get the actual value
  const decodedValue = useMemo(() => {
    if (!hash) return initialValue;
    try {
      return atou(hash);
    } catch {
      return initialValue;
    }
  }, [hash, initialValue]);

  // Function to set the decoded value (will encode and update hash)
  const setDecodedValue: Dispatch<SetStateAction<string>> = (value) => {
    const newValue = typeof value === "function" ? value(decodedValue) : value;
    const encoded = utoa(newValue);
    setHash(encoded);
  };

  return [decodedValue, setDecodedValue, hash];
}

/**
 * Hook to manage the location hash state
 * @returns [hash, setHash] - hash without the leading # character
 */
function useLocationHashState(): [string, Dispatch<SetStateAction<string>>] {
  const [hash, setHash] = useState<string>(() => {
    // Initialize with current hash (without #)
    return window.location.hash.slice(1);
  });

  // Update hash in URL when state changes
  useEffect(() => {
    window.location.hash = hash;
  }, [hash]);

  // Listen for hash changes from browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash.slice(1));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return [hash, setHash];
}
