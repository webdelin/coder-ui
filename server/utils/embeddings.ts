import type { FeatureExtractionPipeline } from '@huggingface/transformers'

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'
export const EMBEDDING_DIM = 384

let pipelineInstance: FeatureExtractionPipeline | null = null
let pipelineLoading: Promise<FeatureExtractionPipeline> | null = null

async function getPipeline(): Promise<FeatureExtractionPipeline> {
  if (pipelineInstance) return pipelineInstance

  if (!pipelineLoading) {
    pipelineLoading = (async () => {
      const { pipeline } = await import('@huggingface/transformers')
      console.log('[embeddings] Loading model:', MODEL_NAME)
      const pipe = await pipeline('feature-extraction', MODEL_NAME, {
        dtype: 'fp32',
      })
      console.log('[embeddings] Model loaded')
      pipelineInstance = pipe as FeatureExtractionPipeline
      return pipelineInstance
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
