import { Link, Navigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FullPageError, FullPageLoader } from '@/components/PageStates'
import { useBusinessProfile } from '@/lib/queries'

export function MyBusinessPage() {
  const { data, isPending, isError, refetch } = useBusinessProfile()

  if (isPending) return <FullPageLoader />
  if (isError) return <FullPageError onRetry={() => void refetch()} />
  if (!data) return <Navigate to="/assessment" replace />

  return (
    <div className="bg-cream flex min-h-[calc(100svh-4rem)] justify-center px-4 py-10">
      <Card className="h-fit w-full max-w-[600px]">
        <CardContent className="flex flex-col items-start gap-4">
          <h1 className="text-navy text-2xl font-extrabold">My Business</h1>
          <p>{data.businessName || 'Unnamed business'}</p>
          <Button asChild variant="outline" className="h-11 px-6">
            <Link to="/assessment">Edit Details</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
