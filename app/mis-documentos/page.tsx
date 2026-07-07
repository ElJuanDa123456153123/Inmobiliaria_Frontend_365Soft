"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"
import { apiService, Document } from "@/lib/services/api"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Loader2 } from "lucide-react"

export default function MisDocumentosPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentFilter, setCurrentFilter] = useState<string | undefined>(
    undefined
  )

  const fetchDocuments = async (
    page: number = 1,
    type?: string
  ) => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/ingresar")
      return
    }

    try {
      setLoading(true)
      const response = await apiService.getDocuments(page, 20, type)
      setDocuments(response.documents)
      setTotalCount(response.total)
      setCurrentPage(response.page)
      setTotalPages(response.total_pages)
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleUploadSuccess = (document: Document) => {
    // Refresh documents list
    fetchDocuments(currentPage, currentFilter)
  }

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await apiService.deleteDocument(documentId)

      // Remove from local state
      setDocuments(documents.filter((doc) => doc.id !== documentId))
      setTotalCount((prev) => prev - 1)

      // If no documents left and not on first page, go back
      if (documents.length === 1 && currentPage > 1) {
        fetchDocuments(currentPage - 1, currentFilter)
      } else {
        fetchDocuments(currentPage, currentFilter)
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Error al eliminar el documento")
    }
  }

  const handlePageChange = (page: number) => {
    fetchDocuments(page, currentFilter)
  }

  const handleFilterChange = (type?: string) => {
    setCurrentFilter(type)
    fetchDocuments(1, type)
  }

  const handlePreview = (document: Document) => {
    window.open(document.file_url, "_blank")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Mis Documentos</h1>
                <p className="text-muted-foreground">
                  Gestiona tus documentos, fotos y comprobantes
                </p>
              </div>
              <Button onClick={() => setUploadOpen(true)} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Subir Documento
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FileText className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Públicos</p>
                    <p className="text-2xl font-bold">
                      {documents.filter((d) => d.is_public).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Privados</p>
                    <p className="text-2xl font-bold">
                      {documents.filter((d) => !d.is_public).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Esta página</p>
                    <p className="text-2xl font-bold">{documents.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DocumentList
              documents={documents}
              loading={loading}
              onDelete={handleDeleteDocument}
              onPreview={handlePreview}
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onFilterChange={handleFilterChange}
              currentFilter={currentFilter}
            />
          )}
        </div>
      </main>

      <Footer />

      {/* Upload Dialog */}
      <DocumentUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  )
}
