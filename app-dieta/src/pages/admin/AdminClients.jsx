import React, { useState, useEffect } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { getAllStudents } from '../../services/dietService'

export default function AdminClients() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState("")
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStudents()
    }, [])

    const loadStudents = async () => {
        try {
            const data = await getAllStudents()
            setStudents(data)
        } catch (error) {
            console.error('Error loading students:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredStudents = students.filter(student =>
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background p-6 space-y-6 pb-24">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Meus Alunos</h1>
                    <p className="text-muted-foreground">Gerencie as dietas e progresso.</p>
                </div>
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                    A
                </div>
            </header>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Buscar aluno..."
                    className="pl-10 bg-card border-border/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Clients List */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                    Carregando...
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredStudents.map(student => (
                        <div
                            key={student.id}
                            className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group"
                            onClick={() => navigate(`/admin/clients/${student.id}`)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-lg">
                                    {student.full_name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{student.full_name || 'Sem nome'}</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{student.goal || 'Sem objetivo'}</span>
                                        {student.diet_templates && (
                                            <>
                                                <span>•</span>
                                                <span className="text-primary font-medium">
                                                    {student.diet_templates.name}
                                                </span>
                                            </>
                                        )}
                                        {!student.diet_templates && (
                                            <>
                                                <span>•</span>
                                                <span className="text-yellow-500">Sem dieta</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary group-hover:bg-primary/10">
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    ))}

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            Nenhum aluno encontrado.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
