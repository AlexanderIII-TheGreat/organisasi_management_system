'use client';

import { useEffect, useState } from 'react';
import { getTalentTests, getTalentTest, submitTalentTest } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Option {
  id: number;
  option_text: string;
  recommended_division: string;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface TestData {
  id: number;
  title: string;
  questions: Question[];
}

interface ResultData {
  recommended_division: string;
  analysis: string;
}

export default function MinatBakatPage() {
  const router = useRouter();
  const [test, setTest] = useState<TestData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question_id: number; option_id: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil tes pertama yang aktif
        const response = await getTalentTests();
        if (response.success && response.data.length > 0) {
          const testId = response.data[0].id;
          const detailResponse = await getTalentTest(testId);
          if (detailResponse.success) {
            setTest(detailResponse.data);
          }
        } else {
          setError('Tidak ada tes yang tersedia saat ini.');
        }
      } catch (err) {
        setError('Gagal memuat data tes.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectOption = (questionId: number, optionId: number) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.question_id === questionId);
    
    if (existingIndex > -1) {
      newAnswers[existingIndex] = { question_id: questionId, option_id: optionId };
    } else {
      newAnswers.push({ question_id: questionId, option_id: optionId });
    }
    
    setAnswers(newAnswers);

    // Auto next after selection
    if (currentStep < (test?.questions.length || 0) - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (!test) return;
    setIsSubmitting(true);
    try {
      const response = await submitTalentTest(test.id, { answers });
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.message || 'Gagal mengirim jawaban.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim jawaban.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDivisionImage = (division: string) => {
    switch(division) {
      case 'Humas & Media': return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800';
      case 'Kreatif & Konsep': return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800';
      case 'Logistik & Dana': return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800';
      case 'Olahraga': return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800';
      case 'Kerohanian': return 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800';
      default: return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-bold animate-pulse">MEMPERSIAPKAN TES...</p>
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Waduh!</h2>
        <p className="text-on-surface-variant">{error}</p>
        <button onClick={() => router.push('/home')} className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold">Kembali</button>
      </div>
    );
  }

  const currentQuestion = test?.questions[currentStep];
  const progress = test ? ((currentStep + 1) / test.questions.length) * 100 : 0;
  const isLastStep = test ? currentStep === test.questions.length - 1 : false;
  const hasAnsweredCurrent = currentQuestion ? answers.some(a => a.question_id === currentQuestion.id) : false;

  return (
    <>
      <div className="fixed top-0 left-0 -z-20 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-tertiary-fixed/30 rounded-full blur-[150px]"></div>
      </div>

      {!result ? (
        /* ================= QUIZ VIEW ================= */
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-primary font-headline font-bold uppercase tracking-widest text-xs">Evaluasi Penempatan</span>
                <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mt-1">{test?.title}</h1>
              </div>
              <span className="text-on-surface-variant font-label font-medium">Pertanyaan {currentStep + 1} dari {test?.questions.length}</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-10 min-h-[100px]">
            <h2 className="text-2xl md:text-4xl font-headline font-bold text-on-surface leading-tight">
              {currentQuestion?.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion?.options.map((opt) => {
              const isSelected = answers.find(a => a.question_id === currentQuestion.id)?.option_id === opt.id;
              return (
                <button 
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={`group flex items-start gap-4 p-6 rounded-2xl border transition-all duration-300 text-left ${
                    isSelected 
                      ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                      : 'bg-surface-container-lowest border-outline-variant/15 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-transform group-active:scale-90 ${
                    isSelected ? 'bg-white text-primary font-black' : 'bg-secondary-container text-primary'
                  }`}>
                    <span className="text-sm font-bold">{isSelected ? '✓' : ''}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-headline font-bold text-lg leading-relaxed ${isSelected ? 'text-white' : 'text-on-surface'}`}>
                      {opt.option_text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-16 flex justify-between items-center">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 font-headline font-bold text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Sebelumnya
            </button>
            
            {isLastStep ? (
              <button 
                onClick={handleSubmit}
                disabled={!hasAnsweredCurrent || isSubmitting}
                className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-primary/20 scale-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Menganalisis...' : 'Selesaikan Tes'}
              </button>
            ) : (
              <button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!hasAnsweredCurrent}
                className="flex items-center gap-2 px-6 py-3 font-headline font-bold text-primary transition-all disabled:opacity-30"
              >
                Selanjutnya
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ================= RESULT VIEW ================= */
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-12">
            <span className="text-primary font-headline font-bold uppercase tracking-widest text-xs">Hasil Analisis Anda</span>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tighter mt-2">Anda direkomendasikan di...</h1>
          </div>

          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 aspect-[16/9] md:aspect-[21/9]">
            <img 
              alt="Recommendation" 
              className="w-full h-full object-cover" 
              src={getDivisionImage(result.recommended_division)} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
              <h2 className="text-white text-3xl md:text-5xl font-headline font-black">{result.recommended_division}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2 space-y-6">
              <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed font-medium">
                Berdasarkan jawabanmu, kamu memiliki potensi besar untuk berkontribusi secara maksimal di bidang <strong>{result.recommended_division}</strong>. Analisismu menunjukkan kecenderungan yang kuat terhadap nilai-nilai inti divisi ini.
              </p>
              <div className="p-8 bg-surface-container-low rounded-[2rem] border border-outline-variant/10 shadow-sm">
                <h4 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                  Analisis Profil Bakat
                </h4>
                <div className="space-y-4 text-on-surface-variant text-sm leading-relaxed italic opacity-80">
                  {result.analysis}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => router.push('/home')}
                className="w-full bg-primary text-white font-headline font-extrabold py-5 rounded-full shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all text-center"
              >
                Kembali ke Beranda
              </button>
              <button className="w-full bg-white text-primary border-2 border-primary/20 font-headline font-bold py-5 rounded-full hover:bg-primary/5 transition-all">
                Unduh Hasil (PDF)
              </button>
              <p className="text-center text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest mt-2 px-6">
                Hasil ini telah disimpan di profil digital Anda.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}