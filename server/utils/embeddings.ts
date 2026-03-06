import type { FeatureExtractionPipeline } from '@huggingface/transformers'

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'
export const EMBEDDING_DIM = 384

let pipelineInstance: FeatureExtractionPipeline | null = null
let pipelineLoading: Promise<FeatureExtractionPipeline> | null = null
let pipelineFailed = false

async function getPipeline(): Promise<FeatureExtractionPipeline> {
  if (pipelineFailed) throw new Error('[embeddings] Pipeline permanently failed — restart server to retry')
  if (pipelineInstance) return pipelineInstance

  if (!pipelineLoading) {
    pipelineLoading = (async () => {
      try {
        const { pipeline } = await import('@huggingface/transformers')
        console.log('[embeddings] Loading model:', MODEL_NAME)
        const pipe = await pipeline('feature-extraction', MODEL_NAME, {
          dtype: 'fp32',
        })
        console.log('[embeddings] Model loaded')
        pipelineInstance = pipe as FeatureExtractionPipeline
        return pipelineInstance
      } catch (err) {
        pipelineFailed = true
        pipelineLoading = null
        console.error('[embeddings] Failed to load model — memory indexing disabled until restart:', (err as Error).message)
        throw err
      }
    })()
  }

  return pipelineLoading
}

/**
 * Generate a 384-dimensional normalized embedding for a text string.
 */
export async function generateEmbedding(text: string): Promise<Float32Array> {
  const pipe = await getPipeline()
  const output = await pipe(text, { pooling: 'mean', normalize: true })
  const values = output.tolist()[0] as number[]
  return new Float32Array(values)
}
