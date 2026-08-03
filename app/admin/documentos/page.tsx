"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiService, Document } from "@/lib/services/api"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, Trash2, Eye, Download, Filter, User as UserIcon } from "lucide-react"

export default function AdminDocumentosPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentFilter, setCurrentFilter] = useState<string | undefined>(undefined)
  const [userFilter, setUserFilter] = useState<string>("")

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    property_photos: 0,
    receipts: 0,
    contracts: 0,
    public: 0,
    private: 0,
  })

  const fetchDocuments = async (
    page: number = 1,
    type?: string
  ) => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      setLoading(true)
      // Para admin, usamos getAllDocuments
      const response = await apiService.getAllDocuments(page, 50, type)
      setDocuments(response.documents)
      setTotalCount(response.total)
      setCurrentPage(response.page)
      setTotalPages(response.total_pages)

      // Calcular estadísticas
      const docs = response.documents
      setStats({
        total: response.total,
        property_photos: docs.filter((d) => d.type === "PROPERTY_PHOTO").length,
        receipts: docs.filter((d) => d.type === "RECEIPT").length,
        contracts: docs.filter((d) => d.type === "CONTRACT").length,
        public: docs.filter((d) => d.is_public).length,
        private: docs.filter((d) => !d.is_public).length,
      })
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm("¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await apiService.deleteDocument(documentId)
      setDocuments(documents.filter((doc) => doc.id !== documentId))
      setTotalCount((prev) => prev - 1)

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

  const handlePreview = (doc: Document) => {
    window.open(doc.file_url, "_blank")
  }

  const handleDownload = (doc: Document) => {
    const link = document.createElement("a")
    link.href = doc.file_url
    link.download = doc.title || "documento"
    link.click()
  }

  const handlePageChange = (page: number) => {
    fetchDocuments(page, currentFilter)
  }

  const handleFilterChange = (type?: string) => {
    setCurrentFilter(type)
    fetchDocuments(1, type)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PROPERTY_PHOTO: "Foto de Propiedad",
      RECEIPT: "Comprobante de Pago",
      CONTRACT: "Contrato",
      PUBLIC: "Documento Público",
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PROPERTY_PHOTO: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      RECEIPT: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      CONTRACT: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      PUBLIC: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    }
    return colors[type] || "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"
  }

  // Filtrar por usuario (búsqueda en tiempo real)
  const filteredDocuments = userFilter
    ? documents.filter((d) =>
        d.user_name?.toLowerCase().includes(userFilter.toLowerCase()) ||
        d.user_email?.toLowerCase().includes(userFilter.toLowerCase())
      )
    : documents

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Documentos</h1>
        <p className="text-muted-foreground">
          Administra todos los documentos del sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg dark:bg-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg dark:bg-blue-500/20">
              <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fotos</p>
              <p className="text-2xl font-bold">{stats.property_photos}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg dark:bg-green-500/20">
              <FileText className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recibos</p>
              <p className="text-2xl font-bold">{stats.receipts}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg dark:bg-purple-500/20">
              <FileText className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contratos</p>
              <p className="text-2xl font-bold">{stats.contracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg dark:bg-green-500/20">
              <FileText className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Públicos</p>
              <p className="text-2xl font-bold">{stats.public}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg dark:bg-red-500/20">
              <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Privados</p>
              <p className="text-2xl font-bold">{stats.private}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filtrar por tipo:
          </div>
          <Button
            variant={!currentFilter ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(undefined)}
          >
            Todos
          </Button>
          <Button
            variant={currentFilter === "PROPERTY_PHOTO" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("PROPERTY_PHOTO")}
          >
            Fotos
          </Button>
          <Button
            variant={currentFilter === "RECEIPT" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("RECEIPT")}
          >
            Recibos
          </Button>
          <Button
            variant={currentFilter === "CONTRACT" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("CONTRACT")}
          >
            Contratos
          </Button>
          <Button
            variant={currentFilter === "PUBLIC" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("PUBLIC")}
          >
            Públicos
          </Button>

          <div className="ml-auto">
            <input
              type="text"
              placeholder="Buscar por usuario..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-card rounded-lg p-12 shadow-sm border border-border text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
          <p className="text-muted-foreground">
            {userFilter
              ? "No se encontraron documentos para este usuario"
              : "No hay documentos en el sistema"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full table-auto">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Visibilidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.file_type || "Archivo"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          doc.type
                        )}`}
                      >
                        {getTypeLabel(doc.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.user_name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.user_email || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {doc.property_id ? `#${doc.property_id}` : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.is_public
                            ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                        }`}
                      >
                        {doc.is_public ? "Público" : "Privado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(doc)}
                          title="Ver"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                          title="Eliminar"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-card rounded-lg shadow-sm border border-border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.file_type || "Archivo"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(doc.type)}`}>
                      {getTypeLabel(doc.type)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visibilidad:</span>
                    <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      doc.is_public
                        ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                        : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    }`}>
                      {doc.is_public ? "Público" : "Privado"}
                    </span>
                  </div>
                  {doc.property_id && (
                    <div>
                      <span className="text-muted-foreground">Propiedad:</span>
                      <span className="ml-1 text-foreground">#{doc.property_id}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="ml-1 text-foreground">{new Date(doc.created_at).toLocaleDateString("es-BO")}</span>
                  </div>
                </div>
                {doc.user_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.user_name}</p>
                      <p className="text-xs text-muted-foreground">{doc.user_email || ""}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(doc)}
                    title="Ver"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                    title="Eliminar"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
