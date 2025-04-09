'use client';

import { useState, useEffect, use, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Phone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Contact {
  name: string;
  phone: string;
  contact: string;
  intimacy: string;
  group: string;
  invited?: boolean;
}

// 슬라이드 애니메이션 변형
const slideVariants = {
  enterFromRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { type: 'tween', ease: 'easeInOut', duration: 0.3 },
  },
  enterFromLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { type: 'tween', ease: 'easeInOut', duration: 0.3 },
  },
};

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const isMobile = useMobile();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intimacyValue, setIntimacyValue] = useState('');
  const [groupValue, setGroupValue] = useState('');
  const [invitedValue, setInvitedValue] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [jumpToIndex, setJumpToIndex] = useState('');
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwipingActive, setIsSwipingActive] = useState(false);
  const [swipeDelta, setSwipeDelta] = useState(0);

  const resolvedParams = use(params);

  // 모든 useMemo 훅을 먼저 정의하여 순서 일관성 유지
  const { uniqueGroups, allGroups } = useMemo(() => {
    const uniqueGroups = Array.from(
      new Set((contacts || []).map((c) => c.group).filter(Boolean))
    );
    const predefinedGroups = [
      '가족',
      '친구',
      '직장',
      '학교',
      '다빈치',
      'YEHS',
      'ROTC',
      '롯데',
      '동국대',
      '군대',
      '기타',
    ];
    const allGroups = Array.from(
      new Set([...uniqueGroups, ...predefinedGroups])
    );

    return { uniqueGroups, allGroups };
  }, [contacts]);

  // 현재 슬라이드 방향에 따른 애니메이션 선택
  const currentVariant = useMemo(
    () =>
      direction >= 0
        ? slideVariants.enterFromRight
        : slideVariants.enterFromLeft,
    [direction]
  );

  // 진행 표시기 - 조건부 반환 내부에서 처리
  const renderDots = useMemo(() => {
    return (
      <div
        className={`absolute bottom-0 left-0 right-0 flex justify-center pb-1 ${
          contacts.length <= 1 ? 'hidden' : ''
        }`}
      >
        <div className='flex gap-1'>
          {Array.from({
            length: Math.min(Math.max(contacts.length, 1), 5),
          }).map((_, i) => {
            // 진행 표시기를 5개로 제한하고 현재 위치에 따라 표시
            const isCenter =
              contacts.length <= 5 ||
              (currentIndex < 2 && i < 5) ||
              (currentIndex >= contacts.length - 3 &&
                i >= Math.max(0, 5 - (contacts.length - currentIndex))) ||
              (i >= currentIndex - 2 && i <= currentIndex + 2);

            const isActive =
              contacts.length <= 5
                ? i === currentIndex
                : (currentIndex < 2 && i === currentIndex) ||
                  (currentIndex >= contacts.length - 3 &&
                    i ===
                      Math.min(4, 4 - (contacts.length - 1 - currentIndex))) ||
                  i === 2;

            return (
              isCenter && (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    isActive ? 'w-4 bg-rose-500' : 'w-2 bg-gray-300'
                  }`}
                />
              )
            );
          })}
        </div>
      </div>
    );
  }, [contacts.length, currentIndex]);

  const findFirstIncompleteContact = useCallback(
    (contacts: Contact[]) => {
      const incompleteIndex = contacts.findIndex(
        (contact) => !contact.intimacy || !contact.group
      );
      if (incompleteIndex !== -1) {
        setCurrentIndex(incompleteIndex);
        router.push(`/review/${incompleteIndex + 1}`);
      } else {
        setCurrentIndex(0);
        router.push('/review/1');
      }
    },
    [router]
  );

  useEffect(() => {
    // Load contacts from localStorage
    const storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
      try {
        const parsedContacts = JSON.parse(storedContacts);
        setContacts(parsedContacts);

        // Set initial index from URL parameter
        const index = parseInt(resolvedParams.id) - 1;
        if (!isNaN(index) && index >= 0 && index < parsedContacts.length) {
          setCurrentIndex(index);
        } else {
          // Find first contact without intimacy or group
          findFirstIncompleteContact(parsedContacts);
        }
      } catch (error) {
        console.error('Failed to parse contacts:', error);
      }
    }
  }, [resolvedParams.id, findFirstIncompleteContact]);

  useEffect(() => {
    if (contacts.length > 0 && currentIndex < contacts.length) {
      setIntimacyValue(contacts[currentIndex].intimacy);
      setGroupValue(contacts[currentIndex].group);
      setInvitedValue(contacts[currentIndex].invited || false);
    }
  }, [currentIndex, contacts]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwipingActive(true);
    setSwipeDelta(0);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart || !isSwipingActive) return;

      const currentX = e.targetTouches[0].clientX;
      const delta = touchStart - currentX;

      // 스와이프 거리 제한 (너무 많이 움직이지 않도록)
      const limitedDelta = Math.min(Math.max(delta, -150), 150);
      setSwipeDelta(limitedDelta);
      setTouchEnd(currentX);
    },
    [touchStart, isSwipingActive]
  );

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      router.push(`/review/${newIndex + 1}`, { scroll: false });
    }
  }, [currentIndex, router]);

  const handleNext = useCallback(() => {
    if (currentIndex < contacts.length - 1) {
      setDirection(1);
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      router.push(`/review/${newIndex + 1}`, { scroll: false });
    }
  }, [currentIndex, contacts.length, router]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !isSwipingActive) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < contacts.length - 1) {
      handleNext();
    } else if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwipingActive(false);
    setSwipeDelta(0);
  }, [
    touchStart,
    touchEnd,
    isSwipingActive,
    currentIndex,
    contacts.length,
    handleNext,
    handlePrevious,
  ]);

  const handleJumpToIndex = useCallback(() => {
    const index = Number.parseInt(jumpToIndex, 10);
    if (!isNaN(index) && index > 0 && index <= contacts.length) {
      // 방향 설정: 현재 인덱스보다 크면 오른쪽, 작으면 왼쪽
      setDirection(index - 1 > currentIndex ? 1 : -1);
      setCurrentIndex(index - 1);
      router.push(`/review/${index}`, { scroll: false });
      setSheetOpen(false);
      setJumpToIndex('');
    } else {
      toast({
        title: '유효하지 않은 인덱스',
        description: `1부터 ${contacts.length}까지의 숫자를 입력하세요.`,
        variant: 'destructive',
      });
    }
  }, [jumpToIndex, contacts.length, currentIndex, router]);

  // 연락처 정보 변경 시 자동 저장 처리
  useEffect(() => {
    if (contacts.length > 0 && currentIndex < contacts.length) {
      const updatedContacts = [...contacts];
      const previousValues = {
        intimacy: updatedContacts[currentIndex].intimacy,
        group: updatedContacts[currentIndex].group,
        invited: updatedContacts[currentIndex].invited,
      };

      updatedContacts[currentIndex] = {
        ...updatedContacts[currentIndex],
        intimacy: intimacyValue || updatedContacts[currentIndex].intimacy,
        group: groupValue || updatedContacts[currentIndex].group,
        invited: invitedValue,
      };

      const valuesChanged =
        previousValues.intimacy !== intimacyValue ||
        previousValues.group !== groupValue ||
        previousValues.invited !== invitedValue;

      if (valuesChanged) {
        setContacts(updatedContacts);
        localStorage.setItem('contacts', JSON.stringify(updatedContacts));

        toast({
          title: '연락처 정보 저장됨',
          description: `${updatedContacts[currentIndex].name}님의 정보가 업데이트되었습니다.`,
        });
      }
    }
  }, [intimacyValue, groupValue, invitedValue, contacts, currentIndex]);

  if (contacts.length === 0 || currentIndex >= contacts.length) {
    return (
      <div className='flex h-full flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-center text-xl'>
              연락처를 찾을 수 없습니다
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <p>검토할 연락처가 없습니다. 먼저 파일을 업로드해주세요.</p>
            <Button asChild className='mt-4 bg-rose-500 hover:bg-rose-600'>
              <Link href='/'>돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentContact = contacts[currentIndex];

  return (
    <div className='flex h-full flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4'>
      <Card
        className='w-full max-w-md relative overflow-hidden'
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        <CardHeader className='flex flex-row items-center justify-between z-10 bg-white'>
          <CardTitle className='text-center text-xl'>연락처 검토</CardTitle>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='text-sm text-gray-500 hover:bg-gray-100'
              >
                {currentIndex + 1}/{contacts.length}{' '}
                <ChevronDown className='ml-1 h-4 w-4' />
              </Button>
            </SheetTrigger>
            <SheetContent side='bottom' className='px-0'>
              <SheetHeader className='text-left px-4 pb-2 border-b'>
                <SheetTitle>연락처 이동</SheetTitle>
              </SheetHeader>
              <div className='p-4'>
                <Label
                  htmlFor='index'
                  className='block text-sm text-gray-500 mb-2'
                >
                  이동할 연락처 번호를 입력하세요 (1-{contacts.length})
                </Label>
                <div className='flex items-center gap-3 mt-2'>
                  <Input
                    id='index'
                    type='number'
                    min='1'
                    max={contacts.length}
                    value={jumpToIndex}
                    onChange={(e) => setJumpToIndex(e.target.value)}
                    className='flex-1'
                    placeholder={`1-${contacts.length}`}
                  />
                  <Button
                    onClick={handleJumpToIndex}
                    className='bg-rose-500 hover:bg-rose-600'
                  >
                    이동
                  </Button>
                </div>
              </div>

              <div className='px-4 py-3 border-t mt-4'>
                <h3 className='text-sm font-medium mb-3'>빠른 이동</h3>
                <div className='grid grid-cols-5 gap-2'>
                  {contacts.length > 0 &&
                    Array.from({ length: Math.min(10, contacts.length) }).map(
                      (_, i) => (
                        <Button
                          key={i}
                          variant='outline'
                          size='sm'
                          className='h-10 w-10 p-0'
                          onClick={() => {
                            setDirection(i > currentIndex ? 1 : -1);
                            setCurrentIndex(i);
                            router.push(`/review/${i + 1}`, { scroll: false });
                            setSheetOpen(false);
                          }}
                        >
                          {i + 1}
                        </Button>
                      )
                    )}
                </div>

                {contacts.length > 10 && (
                  <div className='flex gap-2 mt-2 justify-between'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setDirection(-1);
                        setCurrentIndex(0);
                        router.push(`/review/1`, { scroll: false });
                        setSheetOpen(false);
                      }}
                    >
                      처음
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        const middleIndex = Math.floor(contacts.length / 2) - 1;
                        setDirection(middleIndex > currentIndex ? 1 : -1);
                        setCurrentIndex(middleIndex);
                        router.push(`/review/${middleIndex + 1}`, {
                          scroll: false,
                        });
                        setSheetOpen(false);
                      }}
                    >
                      중간
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setDirection(1);
                        setCurrentIndex(contacts.length - 1);
                        router.push(`/review/${contacts.length}`, {
                          scroll: false,
                        });
                        setSheetOpen(false);
                      }}
                    >
                      마지막
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>

        <div className='carousel-container relative overflow-hidden'>
          <AnimatePresence initial={false} mode='wait'>
            <motion.div
              key={currentIndex}
              style={{ x: isSwipingActive ? -swipeDelta : 0 }}
              initial={currentVariant.initial}
              animate={currentVariant.animate}
              exit={currentVariant.exit}
              transition={currentVariant.transition}
              className='w-full'
            >
              <CardContent className='space-y-4 bg-white'>
                <div className='space-y-2'>
                  <Label>이름</Label>
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <User className='h-4 w-4 text-gray-500' />
                    <span>{currentContact.name}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>전화번호</Label>
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <Phone className='h-4 w-4 text-gray-500' />
                    <span>{currentContact.phone}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>친밀도</Label>
                  <Select
                    value={intimacyValue}
                    onValueChange={setIntimacyValue}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='친밀도를 선택하세요' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>1</SelectItem>
                      <SelectItem value='2'>2</SelectItem>
                      <SelectItem value='3'>3</SelectItem>
                      <SelectItem value='4'>4</SelectItem>
                      <SelectItem value='5'>5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>그룹</Label>
                  <Select value={groupValue} onValueChange={setGroupValue}>
                    <SelectTrigger>
                      <SelectValue placeholder='그룹을 선택하세요' />
                    </SelectTrigger>
                    <SelectContent>
                      {allGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center justify-between'>
                  <Label htmlFor='invited'>초대 여부</Label>
                  <Switch
                    id='invited'
                    checked={invitedValue}
                    onCheckedChange={setInvitedValue}
                  />
                </div>
              </CardContent>
            </motion.div>
          </AnimatePresence>
        </div>

        {isMobile && (
          <div className='absolute z-10 inset-y-0 flex items-center justify-between w-full px-2 pointer-events-none'>
            {currentIndex > 0 && (
              <div className='h-8 w-8 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 p-0'
                  onClick={handlePrevious}
                >
                  <ChevronLeft className='h-5 w-5' />
                </Button>
              </div>
            )}
            {currentIndex < contacts.length - 1 && (
              <div className='h-8 w-8 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto ml-auto'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 p-0'
                  onClick={handleNext}
                >
                  <ChevronRight className='h-5 w-5' />
                </Button>
              </div>
            )}
          </div>
        )}

        {!isMobile && (
          <CardFooter className='flex justify-between bg-white z-10'>
            <Button
              variant='outline'
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className='flex items-center gap-1'
            >
              <ChevronLeft className='h-4 w-4' /> 이전
            </Button>
            <Button
              variant='outline'
              onClick={handleNext}
              disabled={currentIndex === contacts.length - 1}
              className='flex items-center gap-1'
            >
              다음 <ChevronRight className='h-4 w-4' />
            </Button>
          </CardFooter>
        )}

        {isMobile && (
          <div className='text-center text-xs text-gray-500 py-2 bg-white'>
            좌우로 스와이프하여 이전/다음 연락처로 이동
          </div>
        )}

        {/* 진행 표시기 */}
        {renderDots}
      </Card>
    </div>
  );
}
