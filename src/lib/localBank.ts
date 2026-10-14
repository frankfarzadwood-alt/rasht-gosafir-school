/** Loads items approved in the device-local review workspace into gameplay. No-op until the workspace storage exists. */
export async function loadLocalOverlay(): Promise<void> {
  // Device-local storage for the review workspace is not built yet; the bundled 308 starter questions remain the only playable set.
}
