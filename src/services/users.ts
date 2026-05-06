import pb from '@/lib/pocketbase/client'

export const updateUser = (id: string, data: any) => pb.collection('users').update(id, data)
export const deleteUserAccount = (id: string) => pb.collection('users').delete(id)
