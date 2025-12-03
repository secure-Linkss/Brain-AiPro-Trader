"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, User } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LoadingAnimation } from "@/components/loading-animation"

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch('/api/admin/users')
                const data = await res.json()
                setUsers(data.users)
            } catch (error) {
                console.error('Failed to fetch users', error)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    if (loading) return <div className="flex h-96 items-center justify-center"><LoadingAnimation /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                    <p className="text-slate-400">Manage user access and subscriptions</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <DataTable columns={columns} data={users} searchKey="email" />
        </div>
    )
}
