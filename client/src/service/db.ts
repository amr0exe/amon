const openDB = () => {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open("amonStore", 1)

		request.onupgradeneeded = () => {
			const db = request.result
			if (!db.objectStoreNames.contains("keys")) {
				db.createObjectStore("keys", { keyPath: "nickname" })
			}
		}

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}

const saveKey = async (nickname: string, key: string) => {
	const db = await openDB()

	return new Promise<void>((resolve, reject) => {
		const tx = db.transaction("keys", "readwrite")
		const store = tx.objectStore("keys")

		const getRequest = store.get(nickname)
		getRequest.onsuccess = () => {
			const existing = getRequest.result

			if (existing) {
				// compare old v/s new
				if (existing.privateKey === key) {
					console.log(`Duplicate entry for nickname: "${nickname}" --- data either stale/identical`)
					resolve()
					return
				} else {
					console.log(`Nickname "${nickname}" exits but data differs -- overwriting`)
				}
			}

			const putReq = store.put({ nickname, key })
			putReq.onsuccess = () => resolve()
			putReq.onerror = () => reject(putReq.error)
		}

		getRequest.onerror = () => reject(getRequest.error)
	})
}

const getKey = async (nickname: string) => {
	const db = await openDB()

	return new Promise<string | null>((resolve, reject) => {
		const tx = db.transaction("keys", "readonly")
		const store = tx.objectStore("keys")
		const request = store.get(nickname)

		request.onsuccess = () => resolve(request.result?.key ?? null)
		request.onerror = reject
	})
}

/**
 * Encode an ArrayBuffer or Uint8Array to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
	const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

/**
 * Decode a Base64 string to Uint8Array
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
}

/**
 * 
 * Signs your string with your privateKey
 */
async function signTheOpp(username: string, content: string): Promise<string> {
	const privateKeybase64 = await getKey(username)
	if (!privateKeybase64) {
		console.log("No privateKey found locally !!!")
		return ""
	}

	const privateKeyBuffer = base64ToArrayBuffer(privateKeybase64)
	const privateKey = await crypto.subtle.importKey(
		'pkcs8',
		privateKeyBuffer,
		{ name: 'Ed25519'},
		true,
		['sign']
	)

	// encode content, str -> bytes
	const enc = new TextEncoder()
	const content_bytes = enc.encode(content)

	// sign the opinion
	const signedOpp = await crypto.subtle.sign(
		{ name: 'Ed25519' },
		privateKey,
		content_bytes
	)
	const content_1 = arrayBufferToBase64(signedOpp)

	return content_1
}

export { openDB, saveKey, getKey, base64ToArrayBuffer, arrayBufferToBase64, signTheOpp }
