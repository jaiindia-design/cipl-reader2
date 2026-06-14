'use client'

import { useState, useRef, useCallback } from 'react'

const STANDARD_FIELDS = ['Name', 'PO Number', 'QTY', 'QTY_UNIT', 'Weight in KG', 'Dimension', 'Time', 'Date']

type ExtractedData = Record<string, any>

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setImageFile(file)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const extractData = async () => {
    if (!imageFile) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res((reader.result as string).split(',')[1])
        reader.onerror = () => rej(new Error('Failed to read file'))
        reader.readAsDataURL(imageFile)
      })

      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: imageFile.type }),
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Extraction failed')
      setResult(json.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadJSON = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'grn_data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const standardFields = result
    ? Object.fromEntries(Object.entries(result).filter(([k]) => k !== 'metadata'))
    : {}
  const metadataFields = result?.metadata ?? {}

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans text-[#1A1A1A]">
      
      {/* Top Bar - Matches the top dark bar in the screenshot */}
      <div className="bg-[#0f2b4e] w-full h-10 flex items-center justify-end px-6">
        <span className="text-white text-xs uppercase tracking-widest font-medium">Internal Tools</span>
      </div>

      {/* Main Header - Matches the white navbar style */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0f2b4e] uppercase tracking-wide">AWB Extractor</h1>
              <p className="text-sm text-gray-500">Digitize Goods Receipt Notes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Upload Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0f2b4e] mb-4 uppercase tracking-wide">Upload Document</h2>
              
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors
                  ${dragOver ? 'border-[#0f2b4e] bg-[#f0f4f8]' : 'border-gray-300 bg-gray-50 hover:border-[#0f2b4e]'}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Uploaded document" className="max-h-48 mx-auto object-contain" />
                ) : (
                  <div className="space-y-3">
                    <div className="text-4xl text-gray-400">📄</div>
                    <p className="text-sm text-gray-600 font-medium">Click or drag image here</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">JPG, PNG</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </div>

              {imageFile && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="bg-gray-50 p-3 border border-gray-200 text-sm text-gray-700 flex justify-between items-center">
                    <span className="truncate mr-4">{imageFile.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); setResult(null) }}
                      className="text-red-600 font-medium hover:underline flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <button
                    onClick={extractData}
                    disabled={loading}
                    className="w-full py-3 bg-[#0f2b4e] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#163d70] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing...' : 'Extract Data'}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-600 p-4 text-sm text-red-800">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results Section */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6">
                
                {/* Standard Fields */}
                <div className="bg-white border border-gray-200 shadow-sm">
                  <div className="bg-[#0f2b4e] px-6 py-4">
                    <h2 className="font-bold text-white uppercase tracking-wide">Extracted Data</h2>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest w-1/3">Field</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(standardFields).map(([key, value]) => (
                          <tr key={key} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">{key}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {value !== null && value !== '' ? String(value) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Metadata */}
                {Object.keys(metadataFields).length > 0 && (
                  <div className="bg-white border border-gray-200 shadow-sm">
                    <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                      <h2 className="font-bold text-[#0f2b4e] uppercase tracking-wide text-sm">Additional Metadata</h2>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(metadataFields).map(([key, value]) => (
                          <tr key={key} className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-semibold text-gray-700 w-1/3">{key}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">{String(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end">
                  <button
                    onClick={downloadJSON}
                    className="px-6 py-3 bg-white border-2 border-[#0f2b4e] text-[#0f2b4e] font-bold uppercase tracking-widest text-sm hover:bg-[#0f2b4e] hover:text-white transition-colors"
                  >
                    Download JSON
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] bg-white border border-gray-200 flex flex-col items-center justify-center text-gray-400 space-y-4 p-8 text-center shadow-sm">
                <div className="text-6xl">📊</div>
                <p className="text-lg font-medium text-gray-500">No Data Extracted Yet</p>
                <p className="text-sm max-w-sm">Upload a Goods Receipt Note image and click extract to view the structured data here.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}