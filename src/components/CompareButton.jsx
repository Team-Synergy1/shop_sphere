'use client';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Check, Plus, X } from 'lucide-react';

export default function CompareButton({ productId, className}) {
  const queryClient = useQueryClient();
  
  const { data: comparison } = useQuery({
    queryKey: ['comparison'],
    queryFn: async () => {
      const response = await axios.get('/api/comparison');
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (action) => 
      action === 'add' 
        ? axios.post('/api/comparison', { productId })
        : axios.delete('/api/comparison', { data: { productId } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comparison']);
      toast.success('Successfully update comparison')
    },
    onError: (error) => {
      toast.error('Failed to update comparison', {
        description: error.response?.data?.error || error.message
      });
    }
  });

  const isInComparison = comparison?.products?.some(p => p._id === productId);

  return (
    <Button
      variant="outline"
      size="lg"
      className={className}
      onClick={() => mutation.mutate(isInComparison ? 'remove' : 'add')}
      disabled={mutation.isLoading}
    >
      {mutation.isLoading ? (
        <span className="animate-pulse">...</span>
      ) : isInComparison ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Compare
        </>
      )}
    </Button>
  );
}