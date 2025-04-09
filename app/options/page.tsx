'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Download, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Contact {
  name: string;
  phone: string;
  contact: string;
  intimacy: string;
  group: string;
  invited?: boolean;
}

export default function OptionsPage() {
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState('');
  const [enableSharing, setEnableSharing] = useState(false);
  const [contactCount, setContactCount] = useState(0);

  useEffect(() => {
    // Load contacts from localStorage
    const storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
      try {
        const parsedContacts = JSON.parse(storedContacts);
        setContactCount(parsedContacts.length);
      } catch (error) {
        console.error('Failed to parse contacts:', error);
        setContactCount(0);
      }
    }

    // Check URL for shared data
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedData = urlParams.get('data');
      if (sharedData) {
        try {
          // Decode the URL-safe base64 string
          const decodedString = atob(
            sharedData.replace(/-/g, '+').replace(/_/g, '/')
          );
          const decodedData = JSON.parse(decodedString);

          if (Array.isArray(decodedData) && decodedData.length > 0) {
            localStorage.setItem('contacts', JSON.stringify(decodedData));
            setContactCount(decodedData.length);
            toast({
              title: '데이터 가져오기 성공',
              description: `${decodedData.length}개의 연락처를 가져왔습니다.`,
            });
            // Remove the query parameter from URL
            window.history.replaceState({}, document.title, '/options');
          }
        } catch (error) {
          console.error('Failed to parse shared data:', error);
          toast({
            title: '데이터 가져오기 실패',
            description: '공유된 데이터를 불러오는데 실패했습니다.',
            variant: 'destructive',
          });
        }
      }
    }
  }, []);

  const generateShareUrl = () => {
    try {
      const storedContacts = localStorage.getItem('contacts');
      if (!storedContacts) {
        toast({
          title: '공유 URL 생성 실패',
          description: '연락처 데이터가 없습니다.',
          variant: 'destructive',
        });
        return;
      }

      // Create a URL-safe base64 encoded string
      // First, convert the JSON string to base64
      const base64Data = btoa(unescape(encodeURIComponent(storedContacts)));

      // Make the base64 string URL-safe
      const urlSafeBase64 = base64Data
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Create the URL with the encoded data
      const url = `${window.location.origin}/options?data=${urlSafeBase64}`;

      setShareUrl(url);
      setEnableSharing(true);

      toast({
        title: '공유 URL 생성 완료',
        description: 'URL이 생성되었습니다. 복사 버튼을 클릭하여 복사하세요.',
      });
    } catch (error) {
      console.error('Error generating share URL:', error);
      toast({
        title: '공유 URL 생성 실패',
        description: 'URL을 생성하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'URL 복사 완료',
        description: '공유 URL이 클립보드에 복사되었습니다.',
      });
    }
  };

  const exportData = () => {
    try {
      const storedContacts = localStorage.getItem('contacts');
      if (storedContacts) {
        // Create a JSON file for download
        const blob = new Blob([storedContacts], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'wedding_contacts.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast({
          title: '데이터 내보내기 실패',
          description: '연락처 데이터가 없습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: '데이터 내보내기 실패',
        description: '데이터를 내보내는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const clearData = () => {
    if (
      confirm(
        '모든 연락처 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      localStorage.removeItem('contacts');
      setContactCount(0);
      setShareUrl('');
      setEnableSharing(false);
      toast({
        title: '데이터 삭제 완료',
        description: '모든 연락처 데이터가 삭제되었습니다.',
      });
    }
  };

  return (
    <div className='flex h-full flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-xl'>설정</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='rounded-lg bg-white p-4 shadow-sm'>
            <h3 className='font-medium mb-2'>데이터 관리</h3>
            <p className='text-sm text-gray-500 mb-4'>
              현재 {contactCount}개의 연락처가 있습니다.
            </p>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='share-data'>데이터 공유 활성화</Label>
                  <p className='text-xs text-gray-500'>
                    URL을 통해 연락처 데이터를 공유합니다.
                  </p>
                </div>
                <Switch
                  id='share-data'
                  checked={enableSharing}
                  onCheckedChange={(checked) => {
                    setEnableSharing(checked);
                    if (checked && !shareUrl) {
                      generateShareUrl();
                    }
                  }}
                />
              </div>

              {enableSharing && shareUrl && (
                <div className='space-y-2'>
                  <Label htmlFor='share-url'>공유 URL</Label>
                  <div className='flex space-x-2'>
                    <Input
                      id='share-url'
                      value={shareUrl}
                      readOnly
                      className='flex-1'
                    />
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={copyShareUrl}
                      title='URL 복사'
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                  </div>
                  <p className='text-xs text-gray-500'>
                    이 URL을 공유하면 다른 사람이 당신의 연락처 데이터를 볼 수
                    있습니다.
                  </p>
                </div>
              )}

              <div className='flex space-x-2 pt-2'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={generateShareUrl}
                >
                  <Share2 className='h-4 w-4 mr-2' />
                  URL 생성
                </Button>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={exportData}
                >
                  <Download className='h-4 w-4 mr-2' />
                  내보내기
                </Button>
              </div>
            </div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow-sm'>
            <h3 className='font-medium mb-2'>데이터 초기화</h3>
            <p className='text-sm text-gray-500 mb-4'>
              모든 연락처 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <Button
              variant='destructive'
              onClick={clearData}
              className='w-full'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              모든 데이터 삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
