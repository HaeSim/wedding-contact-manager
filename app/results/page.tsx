'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, User, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Contact {
  name: string;
  phone: string;
  contact: string;
  intimacy: string;
  group: string;
  invited?: boolean;
}

export default function ResultsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [intimacyFilter, setIntimacyFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Counts for each category
  const [counts, setCounts] = useState({
    all: 0,
    invite: 0,
    notInvite: 0,
  });

  useEffect(() => {
    // Load contacts from localStorage
    const storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
      const parsedContacts = JSON.parse(storedContacts);
      setContacts(parsedContacts);
      setFilteredContacts(parsedContacts);

      // Calculate initial counts
      updateCounts(parsedContacts);
    }
  }, []);

  const updateCounts = (contactList: Contact[]) => {
    setCounts({
      all: contactList.length,
      invite: contactList.filter((c) => c.invited === true).length,
      notInvite: contactList.filter((c) => c.invited !== true).length,
    });
  };

  useEffect(() => {
    let result = [...contacts];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone.includes(searchTerm)
      );
    }

    // Apply intimacy filter
    if (intimacyFilter && intimacyFilter !== 'all') {
      result = result.filter((contact) => contact.intimacy === intimacyFilter);
    }

    // Apply group filter
    if (groupFilter && groupFilter !== 'all') {
      result = result.filter((contact) => contact.group === groupFilter);
    }

    // Apply tab filter
    if (activeTab === 'invite') {
      result = result.filter((c) => c.invited === true);
    } else if (activeTab === 'notInvite') {
      result = result.filter((c) => c.invited !== true);
    }

    setFilteredContacts(result);
  }, [contacts, searchTerm, intimacyFilter, groupFilter, activeTab]);

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['name', 'phone', '친밀도(5/5)', '그룹', '초대여부'];
    const csvContent = [
      headers.join('\t'),
      ...filteredContacts.map((contact) =>
        [
          contact.name,
          contact.phone,
          contact.intimacy,
          contact.group,
          contact.invited ? 'O' : contact.invited === false ? 'X' : '',
        ].join('\t')
      ),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'wedding_contacts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'CSV 다운로드 완료',
      description: `${filteredContacts.length}개의 연락처가 다운로드되었습니다.`,
    });
  };

  const navigateToContact = (index: number) => {
    // Find the original index in the full contacts array
    const contact = filteredContacts[index];
    const originalIndex = contacts.findIndex(
      (c) => c.name === contact.name && c.phone === contact.phone
    );

    if (originalIndex !== -1) {
      // Store the index in localStorage to be used in the review page
      localStorage.setItem('currentContactIndex', originalIndex.toString());
      router.push('/review');
    }
  };

  // Get unique groups for filter
  const uniqueGroups = Array.from(
    new Set(contacts.map((contact) => contact.group))
  ).filter(Boolean);

  return (
    <div className='flex h-full flex-col bg-gradient-to-b from-rose-50 to-white p-4'>
      <Card className='w-full max-w-md mx-auto flex flex-col h-full'>
        <CardHeader className='flex flex-row items-center justify-between shrink-0'>
          <CardTitle className='text-xl'>결혼식 연락처 필터</CardTitle>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleDownloadCSV}
            title='Download CSV'
          >
            <Download className='h-5 w-5' />
          </Button>
        </CardHeader>

        <CardContent className='flex flex-col flex-1 overflow-hidden p-4 pt-0'>
          <div className='space-y-4 shrink-0'>
            <div>
              <Label htmlFor='search'>검색</Label>
              <Input
                id='search'
                placeholder='이름 또는 전화번호로 검색'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='intimacy-filter'>친밀도</Label>
                <Select
                  value={intimacyFilter}
                  onValueChange={setIntimacyFilter}
                >
                  <SelectTrigger id='intimacy-filter'>
                    <SelectValue placeholder='전체' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>전체</SelectItem>
                    <SelectItem value='1'>1</SelectItem>
                    <SelectItem value='2'>2</SelectItem>
                    <SelectItem value='3'>3</SelectItem>
                    <SelectItem value='4'>4</SelectItem>
                    <SelectItem value='5'>5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='group-filter'>그룹</Label>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger id='group-filter'>
                    <SelectValue placeholder='전체' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>전체</SelectItem>
                    {uniqueGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Tabs
            defaultValue='all'
            className='w-full flex-1 flex flex-col mt-4'
            onValueChange={setActiveTab}
          >
            <TabsList className='grid w-full grid-cols-3 shrink-0'>
              <TabsTrigger value='all'>전체</TabsTrigger>
              <TabsTrigger value='invite'>초대</TabsTrigger>
              <TabsTrigger value='notInvite'>미초대</TabsTrigger>
            </TabsList>

            <div className='flex-1 overflow-hidden mt-2'>
              <TabsContent
                value='all'
                className='h-full data-[state=active]:flex flex-col'
              >
                <div
                  className='space-y-3 overflow-y-auto flex-1 pr-1'
                  style={{ maxHeight: 'calc(100dvh - 320px)' }}
                >
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact, index) => (
                      <ContactCard
                        key={index}
                        contact={contact}
                        onClick={() => navigateToContact(index)}
                      />
                    ))
                  ) : (
                    <p className='text-center text-sm text-gray-500 py-4'>
                      연락처를 찾을 수 없습니다
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value='invite'
                className='h-full data-[state=active]:flex flex-col'
              >
                <div
                  className='space-y-3 overflow-y-auto flex-1 pr-1'
                  style={{ maxHeight: 'calc(100dvh - 320px)' }}
                >
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact, index) => (
                      <ContactCard
                        key={index}
                        contact={contact}
                        onClick={() => navigateToContact(index)}
                      />
                    ))
                  ) : (
                    <p className='text-center text-sm text-gray-500 py-4'>
                      초대할 연락처를 찾을 수 없습니다
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value='notInvite'
                className='h-full data-[state=active]:flex flex-col'
              >
                <div
                  className='space-y-3 overflow-y-auto flex-1 pr-1'
                  style={{ maxHeight: 'calc(100dvh - 320px)' }}
                >
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact, index) => (
                      <ContactCard
                        key={index}
                        contact={contact}
                        onClick={() => navigateToContact(index)}
                      />
                    ))
                  ) : (
                    <p className='text-center text-sm text-gray-500 py-4'>
                      미초대 연락처를 찾을 수 없습니다
                    </p>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className='text-center text-sm text-gray-500 mt-2 shrink-0'>
            <p>
              {activeTab === 'all' &&
                `총: ${filteredContacts.length}개 연락처 (전체: ${counts.all})`}
              {activeTab === 'invite' &&
                `총: ${filteredContacts.length}개 연락처 (초대: ${counts.invite})`}
              {activeTab === 'notInvite' &&
                `총: ${filteredContacts.length}개 연락처 (미초대: ${counts.notInvite})`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContactCard({
  contact,
  onClick,
}: {
  contact: Contact;
  onClick: () => void;
}) {
  return (
    <div
      className='rounded-lg bg-white p-4 shadow-sm cursor-pointer hover:bg-gray-50'
      onClick={onClick}
    >
      <div className='flex items-start space-x-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 shrink-0'>
          <User className='h-5 w-5 text-rose-500' />
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between'>
            <h3 className='font-medium truncate max-w-[120px] sm:max-w-[180px]'>
              {contact.name}
            </h3>
            <div className='flex flex-wrap justify-end gap-1 ml-1 max-w-[120px]'>
              {contact.invited !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    contact.invited
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {contact.invited ? '초대' : '미초대'}
                </span>
              )}
              {contact.intimacy && (
                <span className='rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700'>
                  {contact.intimacy}/5
                </span>
              )}
              {contact.group && (
                <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 truncate max-w-[80px]'>
                  {contact.group}
                </span>
              )}
            </div>
          </div>
          <div className='mt-1 space-y-1'>
            <div className='flex items-center space-x-1'>
              <Phone className='h-3 w-3 text-gray-400 shrink-0' />
              <span className='text-xs text-gray-600 truncate'>
                {contact.phone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
