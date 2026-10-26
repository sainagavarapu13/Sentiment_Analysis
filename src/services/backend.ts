const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function analyzeTextWithBackend(rawText: string, model = 'logistic_regression') {
  try {
    return await request<any>('/api/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: rawText, model }),
    });
  } catch (error) {
    console.warn('Python backend unavailable, using local NLP pipeline instead.', error);
    return null;
  }
}

export async function inspectFileWithBackend(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    return await request<any>('/api/inspect-file', {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.warn('Python backend unavailable for file inspection, using local file parser instead.', error);
    return null;
  }
}

export async function processDatasetWithBackend(payload: Record<string, any>) {
  try {
    return await request<any>('/api/process-dataset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn('Python backend unavailable for dataset processing, using local dataset parser instead.', error);
    return null;
  }
}
