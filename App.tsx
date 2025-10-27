
import React, { useState, useRef, useMemo } from 'react';
import { quizData } from './data';
import type {
  Answer,
  AppStep,
  Result,
  Scores,
  Verse,
  Hadith,
  Source,
  Question,
} from './types';

// External libraries loaded from CDN in index.html
declare const jspdf: any;
declare const html2canvas: any;

const calculateResult = (answers: Answer[]): Result | null => {
    const scores: Scores = { G1: 0, G2: 0, G3: 0, G4: 0, G5: 0 };
    const weights = { A: 5, B: 4, C: 3, D: 2, E: 1 };

    answers.forEach((answer) => {
      const optionMap = quizData.option_map.find(
        (om) => om.question_id === answer.questionId
      );
      if (optionMap) {
        const groupKey = `${answer.choice}_group` as keyof typeof optionMap;
        const group = optionMap[groupKey];
        if (group && Object.prototype.hasOwnProperty.call(scores, group)) {
            scores[group] += weights[answer.choice];
        }
      }
    });
    
    const winnerGroup = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    const feedbackData = quizData.group_feedback.find(
      (fb) => fb.group_id === winnerGroup
    );
    
    if (!feedbackData) return null;

    const verses: Verse[] = JSON.parse(feedbackData.verses_json);
    
    const hadithSet = quizData.hadith_sets.find(
        (hs) => hs.set_key === feedbackData.hadith_set_key
    );

    const hadiths: Hadith[] = [];
    if (hadithSet) {
        for (let i = 1; i <= 10; i++) {
            const itemKey = `item_${i}` as keyof typeof hadithSet;
            const noteKey = `note_${i}` as keyof typeof hadithSet;
            if (hadithSet[itemKey]) {
                hadiths.push({ item: hadithSet[itemKey] as string, note: hadithSet[noteKey] as string });
            }
        }
    }

    const sourcesData = quizData.sources_per_group.find(
        (spg) => spg.group_id === winnerGroup
    );

    const sources: Source[] = [];
    if (sourcesData) {
        for (let i = 1; i <= 4; i++) {
            const titleKey = `src${i}_title` as keyof typeof sourcesData;
            const urlKey = `src${i}_url` as keyof typeof sourcesData;
            if (sourcesData[titleKey] && sourcesData[urlKey]) {
                sources.push({ title: sourcesData[titleKey] as string, url: sourcesData[urlKey] as string });
            }
        }
    }
    
    const { group_id, verses_json, hadith_set_key, ...feedback } = feedbackData;

    return { scores, winnerGroup, feedback, verses, hadiths, sources };
};


const AppContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-brand-background text-brand-text-primary flex flex-col items-center p-4 selection:bg-brand-secondary/20 background-pattern">
    <main className="w-full flex-grow flex items-center justify-center">
      {children}
    </main>
  </div>
);

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-brand-surface rounded-2xl shadow-custom p-8 md:p-12 w-full mx-auto transition-all duration-500 ${className}`}>
    {children}
  </div>
);

const Footer = () => (
    <footer className="text-center py-6 text-sm text-brand-text-secondary/70">
      by HİLAFETİ MUHAMMEDİYE
    </footer>
);

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <Card className="text-center max-w-2xl animate-fade-in">
    <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-4">Hakikat Pusulası</h1>
    <p className="text-lg text-brand-text-secondary mb-8 max-w-lg mx-auto">Selamün aleyküm, Allah’ın rahmeti ve bereketi üzerinize olsun. Bu test bir yarışma değil, bir farkındalık yolculuğudur. Cevaplarına göre kişisel bir rehberlik sunacağız. Kalbini dinle; hakikat önce kalpte yankılanır.</p>
    <button
      className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 text-xl shadow-lg shadow-brand-primary/30"
      onClick={onStart}
    >
      Teste Başla 🌿
    </button>
  </Card>
);

const QuizScreen: React.FC<{
  question: Question;
  onAnswer: (choice: 'A' | 'B' | 'C' | 'D' | 'E') => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}> = ({ question, onAnswer, currentQuestionIndex, totalQuestions }) => {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <Card className="max-w-3xl animate-fade-in">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 text-sm">
          <h2 className="font-semibold text-brand-primary">Soru {currentQuestionIndex + 1} / {totalQuestions}</h2>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-brand-secondary h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <p className="text-2xl font-semibold font-serif mb-8 text-brand-dark">{question.question_text}</p>
      <div className="space-y-4">
        {(['A', 'B', 'C', 'D', 'E'] as const).map((option) => (
          <button
            key={option}
            className="w-full text-left bg-white border-2 border-gray-200 hover:bg-brand-secondary/10 hover:border-brand-secondary text-brand-text-primary font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-start group"
            onClick={() => onAnswer(option)}
          >
            <span className="font-bold text-brand-primary mr-4">{option}.</span>
            <span className="flex-1">{question[option]}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};


const EmailScreen: React.FC<{
  onSubmit: (email: string) => void;
}> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <Card className="text-center max-w-2xl animate-fade-in">
      <h2 className="text-3xl font-bold font-serif mb-2 text-brand-dark">Rehberliğiniz Hazır</h2>
      <p className="text-brand-text-secondary mb-6">Sonuçların bir kopyasını almak için lütfen e-posta adresinizi girin. Rehberliğiniz e-posta adresinize de gönderilecektir.</p>
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
        <input
          type="email"
          placeholder="E-posta adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white text-brand-dark border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent mb-4 transition-shadow"
          required
        />
        <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-md shadow-brand-primary/30">
          Rehberliğimi Al
        </button>
      </form>
    </Card>
  );
};

const QuoteIcon = () => (
    <svg className="w-8 h-8 text-brand-secondary/30 absolute -top-2 -left-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.5 10c-.28 0-.5.22-.5.5v3c0 .28.22.5.5.5h3c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5h-3zM14.5 10c-.28 0-.5.22-.5.5v3c0 .28.22.5.5.5h3c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5h-3zM4.03 7.51l-1.42 1.42c-.63.63-.18 1.71.71 1.71h.29V14c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2v-3.29c.89 0 1.34-.08 1.71-.71l-1.42-1.42C10.53 6.66 9.5 7 8.5 7S6.47 6.66 4.03 7.51zM19.97 7.51l-1.42 1.42c-.63.63-.18 1.71.71 1.71h.29V14c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2v-3.29c.89 0 1.34-.08 1.71-.71l-1.42-1.42C18.53 6.66 17.5 7 16.5 7S14.47 6.66 19.97 7.51z"></path>
    </svg>
)

const ResultScreen: React.FC<{ result: Result; }> = ({ result }) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = () => {
    const content = resultRef.current;
    if (!content) return;
    
    setIsDownloading(true);

    const sourcesEl = content.querySelector<HTMLElement>('#pdf-sources-section');
    const buttonsEl = content.querySelector<HTMLElement>('#pdf-buttons-section');

    if (sourcesEl) sourcesEl.style.display = 'none';
    if (buttonsEl) buttonsEl.style.display = 'none';

    html2canvas(content, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: content.scrollWidth,
      windowHeight: content.scrollHeight,
    }).then(canvas => {
      if (sourcesEl) sourcesEl.style.display = 'block';
      if (buttonsEl) buttonsEl.style.display = 'block';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasHeight / canvasWidth;
      
      let imgHeight = pdfWidth * ratio;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
      }
      
      pdf.save('hakikat-pusulasi-sonuc.pdf');
      setIsDownloading(false);
    }).catch(() => {
        if (sourcesEl) sourcesEl.style.display = 'block';
        if (buttonsEl) buttonsEl.style.display = 'block';
        setIsDownloading(false);
        alert('PDF oluşturulurken bir hata oluştu.');
    });
  };

  return (
    <Card className="max-w-4xl text-left animate-fade-in">
      <div ref={resultRef} className="p-4">
        <header className="text-center mb-10">
            <h1 className="text-4xl font-bold font-serif text-brand-dark mb-2">Farkındalık Rehberin</h1>
            <h2 className="text-2xl font-semibold text-brand-primary mb-2">{result.feedback.title}</h2>
            <p className="text-brand-text-secondary italic">{result.feedback.summary}</p>
        </header>

        <section className="bg-brand-background/60 p-6 rounded-lg mb-10 space-y-4 text-brand-text-primary text-base leading-relaxed">
          <p>{result.feedback.feedback_p1}</p>
          <p>{result.feedback.feedback_p2}</p>
          <p>{result.feedback.feedback_p3}</p>
          <p>{result.feedback.feedback_p4}</p>
        </section>

        <section className="mb-10">
            <h3 className="text-2xl font-bold font-serif text-brand-dark mb-6 border-b-2 border-brand-secondary/30 pb-3">İlgili Ayetler</h3>
            <ul className="space-y-5">
              {result.verses.map((verse, index) => (
                <li key={index} className="bg-white border-l-4 border-brand-secondary p-4 rounded-r-lg shadow-sm relative">
                  <QuoteIcon />
                  <p className="italic text-brand-text-primary">"{verse.tr}"</p>
                  <p className="text-right font-semibold text-brand-primary mt-2">{verse.ref} <span className="text-brand-text-secondary font-normal">({verse.note})</span></p>
                </li>
              ))}
            </ul>
        </section>

        <section className="mb-10">
            <h3 className="text-2xl font-bold font-serif text-brand-dark mb-6 border-b-2 border-brand-secondary/30 pb-3">Hadis-i Şerifler</h3>
            <ul className="space-y-5">
              {result.hadiths.map((hadith, index) => (
                <li key={index} className="bg-white border-l-4 border-brand-secondary p-4 rounded-r-lg shadow-sm relative">
                  <QuoteIcon />
                  <p className="italic text-brand-text-primary">"{hadith.item}"</p>
                  <p className="text-right text-brand-text-secondary mt-2">{hadith.note}</p>
                </li>
              ))}
            </ul>
        </section>
        
        <p className="font-semibold text-center text-lg my-10 text-brand-dark">{result.feedback.outro}</p>
        <p className="text-center text-sm text-brand-text-secondary/80 mb-8">Rabbim! Kalplerimizi hakikatin nuruyla dirilt, gözlerimizi marifetin ışığıyla aç. Bizi, razı olduğun yolda sabit kıl. Amin.</p>

        <div id="pdf-sources-section">
          <h3 className="text-2xl font-bold font-serif text-brand-dark mb-6 border-b-2 border-brand-secondary/30 pb-3">Önerilen Kaynaklar</h3>
          <ul className="space-y-3">
            {result.sources.map((source, index) => (
              <li key={index}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-secondary hover:underline transition-colors font-medium">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div id="pdf-buttons-section" className="mt-10 pt-8 border-t border-gray-200 flex justify-center">
        <button 
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="w-full md:w-auto bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-400"
        >
          {isDownloading ? 'Oluşturuluyor...' : 'Sonucu PDF Olarak İndir'}
        </button>
      </div>

    </Card>
  );
};


function App() {
  const [appStep, setAppStep] = useState<AppStep>('start');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const result = useMemo(() => {
    if (appStep !== 'results') return null;
    return calculateResult(answers);
  }, [appStep, answers]);


  const handleStartQuiz = () => setAppStep('quiz');

  const handleAnswer = (choice: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const newAnswers = [...answers, { questionId: quizData.questions[currentQuestionIndex].id, choice }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setAppStep('email');
    }
  };

  const finishQuiz = (email: string) => {
    const finalResult = calculateResult(answers);
    setAppStep('results');

    if (finalResult) {
      const WEBHOOK_URL = 'https://mrbyapayzeka.app.n8n.cloud/webhook/islami_test';
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, result: finalResult, answers }),
      }).catch(error => console.error('Webhook error:', error));
    }
  };

  const renderContent = () => {
    switch (appStep) {
      case 'start':
        return <StartScreen onStart={handleStartQuiz} />;
      case 'quiz':
        return (
          <QuizScreen
            question={quizData.questions[currentQuestionIndex]}
            onAnswer={handleAnswer}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={quizData.questions.length}
          />
        );
      case 'email':
        return <EmailScreen onSubmit={(email) => finishQuiz(email)} />;
      case 'results':
        if (!result) return <Card className="text-center">Sonuçlar yükleniyor...</Card>;
        return <ResultScreen result={result} />;
      default:
        return null;
    }
  };

  return (
    <AppContainer>
      <div className="w-full max-w-4xl">
        {renderContent()}
        <Footer />
      </div>
    </AppContainer>
  );
}

export default App;
