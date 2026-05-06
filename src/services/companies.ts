import pb from '@/lib/pocketbase/client'

export const getCompany = (id: string) => pb.collection('companies').getOne(id)

export const updateCompany = async (id: string, data: any) => {
  const formData = new FormData()
  for (const key in data) {
    if (data[key] instanceof File) {
      formData.append(key, data[key])
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, String(data[key]))
    }
  }
  return pb.collection('companies').update(id, formData)
}
