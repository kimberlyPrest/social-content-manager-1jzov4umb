import pb from '@/lib/pocketbase/client'

export const getWebhooks = () => pb.collection('webhooks').getFullList({ sort: '-created' })
export const createWebhook = (data: any) => pb.collection('webhooks').create(data)
export const updateWebhook = (id: string, data: any) => pb.collection('webhooks').update(id, data)
export const deleteWebhook = (id: string) => pb.collection('webhooks').delete(id)
export const testWebhook = (id: string) =>
  pb.send(`/backend/v1/webhooks/${id}/test`, { method: 'POST' })
export const getWebhookLogs = (webhookId: string) =>
  pb.collection('webhook_logs').getFullList({
    filter: `webhook_id = "${webhookId}"`,
    sort: '-created',
    limit: 20,
  })
