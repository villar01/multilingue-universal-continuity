export type MicrophoneErrorCode = 'SECURE_CONTEXT' | 'UNSUPPORTED' | 'DENIED' | 'NOT_FOUND' | 'BUSY' | 'UNKNOWN';

export class MicrophoneAccessError extends Error {
  constructor(public readonly code: MicrophoneErrorCode, message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'MicrophoneAccessError';
  }
}

export function selectSupportedAudioMime(isSupported: (mime: string) => boolean): string | undefined {
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(isSupported);
}

export function createAudioRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = selectSupportedAudioMime((mime) =>
    typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime),
  );
  return mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
}

export async function requestMicrophoneStream(): Promise<MediaStream> {
  if (typeof window === 'undefined' || !window.isSecureContext) {
    throw new MicrophoneAccessError('SECURE_CONTEXT', 'O microfone precisa de uma conexão segura (HTTPS).');
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new MicrophoneAccessError('UNSUPPORTED', 'Este navegador não disponibiliza acesso ao microfone.');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    if (!stream.getAudioTracks().length) {
      stream.getTracks().forEach((track) => track.stop());
      throw new MicrophoneAccessError('NOT_FOUND', 'Nenhuma entrada de áudio foi encontrada.');
    }
    return stream;
  } catch (error) {
    if (error instanceof MicrophoneAccessError) throw error;
    const name = error instanceof DOMException ? error.name : '';
    const code: MicrophoneErrorCode = name === 'NotAllowedError' || name === 'SecurityError'
      ? 'DENIED'
      : name === 'NotFoundError' || name === 'OverconstrainedError'
        ? 'NOT_FOUND'
        : name === 'NotReadableError' || name === 'AbortError'
          ? 'BUSY'
          : 'UNKNOWN';
    throw new MicrophoneAccessError(code, microphoneErrorMessage({ code }), error);
  }
}

export function microphoneErrorMessage(error: Pick<MicrophoneAccessError, 'code'> | unknown): string {
  const code = error instanceof MicrophoneAccessError ? error.code :
    typeof error === 'object' && error && 'code' in error ? (error as { code?: MicrophoneErrorCode }).code : undefined;
  switch (code) {
    case 'SECURE_CONTEXT': return 'Abra o aplicativo pela conexão segura (HTTPS) para usar o microfone.';
    case 'UNSUPPORTED': return 'Este navegador não disponibiliza microfone. Use uma versão atual do Chrome, Edge ou Firefox.';
    case 'DENIED': return 'Permissão de microfone bloqueada. Clique no cadeado ao lado do endereço e permita o microfone para este site.';
    case 'NOT_FOUND': return 'Nenhum microfone foi encontrado pelo navegador. Selecione o dispositivo correto nas permissões do site.';
    case 'BUSY': return 'O microfone está sendo usado por outro aplicativo. Feche chamadas ou gravações e tente novamente.';
    default: return 'Não foi possível acessar o microfone. Verifique a permissão do site e tente novamente.';
  }
}
