// Kill-switch service worker: removes the old offline cache (v5) and reloads open tabs.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
	event.waitUntil((async () => {
		try {
			const keys = await caches.keys();
			await Promise.all(keys.map((k) => caches.delete(k)));
		} catch (e) {}
		// Refresh the browser HTTP cache for files whose URLs did not change between versions.
		const urls = ["./", "index.html"];
		await Promise.all(urls.map((u) => fetch(u, { cache: "reload" }).catch(() => {})));
		try { await self.registration.unregister(); } catch (e) {}
		const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
		for (const c of clients) {
			try {
				const u = new URL(c.url);
				u.searchParams.set("v", "6-" + Date.now());
				c.navigate(u.href);
			} catch (e) {}
		}
	})());
});
