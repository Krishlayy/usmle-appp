import { prisma } from '../src/lib/db';

async function main() {
  console.log('Seeding USMLE Upgrade content...');

  const user = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } }
  }) || await prisma.user.findFirst();

  if (!user) {
    console.error('No user found to assign content to.');
    return;
  }

  const card1 = await prisma.question.findUnique({ where: { qid: 'CARD-1' } });
  const card2 = await prisma.question.findUnique({ where: { qid: 'CARD-2' } });

  // 1. Seed Medical Library Articles
  console.log('1. Seeding Medical Library articles...');

  const articleDissection = await prisma.article.upsert({
    where: { slug: 'aortic-dissection' },
    update: {},
    create: {
      title: 'Aortic Dissection: Diagnosis, Classification & Management',
      slug: 'aortic-dissection',
      summary: 'A comprehensive high-yield guide to aortic dissection pathophysiology, Stanford classification, clinical presentation, and emergency management.',
      body: `## Clinical Overview
Aortic dissection is a life-threatening condition characterized by blood entering the aortic media through a tear in the intima, creating a false lumen that propagates along the aorta.

### Classification: Stanford System
* **Stanford Type A**: Involves the ascending aorta (with or without descending aorta). Surgical emergency requiring prompt open repair.
* **Stanford Type B**: Involves the descending aorta only (distal to the left subclavian artery). Typically managed medically with blood pressure control (IV beta-blockers, target SBP < 120 mmHg) unless complicated by rupture or malperfusion.

### Clinical Presentation
* Sudden onset of severe, sharp, tearing or ripping chest pain radiating to the back (interscapular region).
* Asymmetric blood pressures between upper extremities (> 20 mmHg systolic difference).
* New diastolic decrescendo murmur of aortic regurgitation (Type A).
* Neurological deficits if carotid or vertebral arteries are compromised.

### High-Yield Board Pearls
* **Initial Drug of Choice**: Intravenous beta-blockers (e.g., Esmolol, Labetalol) to decrease both blood pressure AND aortic shear stress (dP/dt). Never give vasodilators (like nitroprusside or hydralazine) without prior beta-blockade, as reflex tachycardia increases wall shear stress.
* **Gold Standard Diagnostic Modality**: CT Angiography of the chest and abdomen in stable patients; Transesophageal Echocardiography (TEE) in hemodynamically unstable or renal insufficiency patients.
* **Risk Factors**: Systemic hypertension (most common overall), Marfan syndrome (fibrillin-1 defect), Ehlers-Danlos syndrome (vascular type, COL3A1 defect), Turner syndrome (bicuspid aortic valve, aortic coarctation), and cocaine abuse.`,
      specialty: 'Cardiology',
      system: 'Cardiovascular',
      tags: ['Aorta', 'Emergency Medicine', 'Pathology', 'High-Yield', 'Stanford Classification'],
      status: 'PUBLISHED',
      authorId: user.id,
      viewsCount: 142,
    }
  });

  const articleEndocarditis = await prisma.article.upsert({
    where: { slug: 'infective-endocarditis' },
    update: {},
    create: {
      title: 'Infective Endocarditis: Modified Duke Criteria & High-Yield Bugs',
      slug: 'infective-endocarditis',
      summary: 'Essential USMLE breakdown of infective endocarditis microbiologic etiologies, Modified Duke diagnostic criteria, and hallmark physical exam findings.',
      body: `## Pathogenesis & Valve Involvement
Infective endocarditis (IE) involves microbial infection of the endocardial surface of the heart, most commonly affecting native or prosthetic heart valves.

* **Most frequently affected native valve**: Mitral valve > Aortic valve.
* **Intravenous drug users (IVDU)**: Tricuspid valve ("Tricuspid for Tripper"). Most common organism is *Staphylococcus aureus*.
* **Prosthetic valves (< 60 days)**: *Staphylococcus epidermidis* (biofilm producer).
* **Dental procedures**: *Streptococcus viridans* (e.g., *S. mutans*, *S. sanguinis* synthesize dextrans from sucrose).
* **Colon cancer / IBD association**: *Streptococcus gallolyticus* (formerly *S. bovis*) — bacteremia mandates colonoscopy!

### Modified Duke Criteria
Diagnosis requires:
* 2 Major criteria, OR
* 1 Major + 3 Minor criteria, OR
* 5 Minor criteria.

#### Major Criteria:
1. **Positive blood cultures** with typical organisms from at least 2 separate blood cultures.
2. **Evidence of endocardial involvement**: Oscillating intracardiac mass on valve/supporting structures (vegetation), abscess, or new partial dehiscence of prosthetic valve.

#### Minor Criteria (FROM JANE):
* **F**ever (> 38.0°C)
* **R**isk factors (IVDU, prosthetic valve, congenital heart disease)
* **O**sler nodes (painful, immune complex deposition on pads of fingers/toes)
* **M**ajor criteria not met
* **J**aneway lesions (painless, erythematous/maculopapular lesions on palms/soles from septic emboli)
* **A**nemia / Arterial emboli
* **N**ailbed splinter hemorrhages
* **E**mboli / Roth spots (retinal hemorrhages with pale centers)`,
      specialty: 'Cardiology',
      system: 'Cardiovascular',
      tags: ['Infectious Disease', 'Microbiology', 'Cardiology', 'Duke Criteria', 'Valvular Disease'],
      status: 'PUBLISHED',
      authorId: user.id,
      viewsCount: 215,
    }
  });

  if (card1) {
    await prisma.articleQuestion.upsert({
      where: { articleId_questionId: { articleId: articleDissection.id, questionId: card1.id } },
      update: {},
      create: { articleId: articleDissection.id, questionId: card1.id }
    });
  }
  if (card2) {
    await prisma.articleQuestion.upsert({
      where: { articleId_questionId: { articleId: articleEndocarditis.id, questionId: card2.id } },
      update: {},
      create: { articleId: articleEndocarditis.id, questionId: card2.id }
    });
  }

  // 2. Seed ReadyDecks
  console.log('2. Seeding ReadyDecks...');

  const deck1 = await prisma.deck.upsert({
    where: { id: 'deck-cardio-hy' },
    update: {},
    create: {
      id: 'deck-cardio-hy',
      title: 'USMLE Step 1: High-Yield Cardiology',
      description: 'Core cardiovascular pathology, valvular murmurs, and emergency protocols for USMLE Step 1 & Step 2 CK.',
      subject: 'Cardiology',
      tags: ['Cardiology', 'High Yield', 'Step 1'],
      isPublished: true,
      authorId: user.id,
    }
  });

  // Create flashcards linked to deck
  if (card1 && card2) {
    const flashcard1 = await prisma.flashcard.upsert({
      where: { id: 'fc-cardio-1' },
      update: {},
      create: {
        id: 'fc-cardio-1',
        userId: user.id,
        questionId: card1.id,
        qbankId: card1.qbankId,
        front: 'What is the Stanford classification for an aortic dissection involving only the descending aorta distal to the left subclavian artery?',
        back: 'Stanford Type B (typically managed medically with IV beta-blockers like esmolol or labetalol).',
        easeFactor: 2.5,
        interval: 1,
      }
    });

    const flashcard2 = await prisma.flashcard.upsert({
      where: { id: 'fc-cardio-2' },
      update: {},
      create: {
        id: 'fc-cardio-2',
        userId: user.id,
        questionId: card2.id,
        qbankId: card2.qbankId,
        front: 'Which heart murmur is characterized by an opening snap followed by a mid-diastolic rumbling murmur at the apex?',
        back: 'Mitral Stenosis (frequently secondary to chronic rheumatic heart disease).',
        easeFactor: 2.5,
        interval: 1,
      }
    });

    await prisma.deckCard.upsert({
      where: { deckId_flashcardId: { deckId: deck1.id, flashcardId: flashcard1.id } },
      update: {},
      create: {
        deckId: deck1.id,
        flashcardId: flashcard1.id,
        position: 1,
      }
    });

    await prisma.deckCard.upsert({
      where: { deckId_flashcardId: { deckId: deck1.id, flashcardId: flashcard2.id } },
      update: {},
      create: {
        deckId: deck1.id,
        flashcardId: flashcard2.id,
        position: 2,
      }
    });
  }

  // 3. Seed Video Learning Hub
  console.log('3. Seeding Video Learning Hub...');

  const courseCardio = await prisma.course.upsert({
    where: { slug: 'cardiovascular-foundations' },
    update: {},
    create: {
      slug: 'cardiovascular-foundations',
      title: 'Cardiovascular Pathology & Board Review',
      description: 'Comprehensive visual lecture series breaking down hemodynamics, valvular lesions, acute coronary syndromes, and congenital heart defects for USMLE Step 1.',
      specialty: 'Cardiology',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
      status: 'PUBLISHED',
      modules: {
        create: [
          {
            title: 'Valvular Heart Disease & Murmurs',
            position: 1,
            lessons: {
              create: [
                {
                  title: 'Aortic Stenosis vs Mitral Regurgitation: Physical Diagnosis',
                  description: 'Dynamic maneuvers, radiation patterns, and carotid pulse contour evaluation in systolic murmurs.',
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  durationSec: 596,
                  position: 1,
                  relatedTopic: 'Valvular Heart Disease',
                  captions: {
                    create: [
                      {
                        language: 'en',
                        label: 'English',
                        fileUrl: '/captions/as_vs_mr.vtt',
                        content: `WEBVTT

00:00:01.000 --> 00:00:05.000
Welcome to this masterclass on systolic murmurs for the USMLE exam.

00:00:05.500 --> 00:00:11.000
Today we contrast aortic stenosis with mitral regurgitation using dynamic auscultation.

00:00:11.500 --> 00:00:18.000
Aortic stenosis produces a crescendo-decrescendo systolic ejection murmur radiating to the carotids.

00:00:18.500 --> 00:00:25.000
Key finding: pulsus parvus et tardus - slow rising and delayed carotid pulse contour.
`
                      }
                    ]
                  }
                },
                {
                  title: 'Diastolic Murmurs: Aortic Regurgitation & Mitral Stenosis',
                  description: 'Wide pulse pressure signs and the opening snap interval in severe mitral stenosis.',
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                  durationSec: 653,
                  position: 2,
                  relatedTopic: 'Valvular Heart Disease',
                  captions: {
                    create: [
                      {
                        language: 'en',
                        label: 'English',
                        fileUrl: '/captions/diastolic_murmurs.vtt',
                        content: `WEBVTT

00:00:01.000 --> 00:00:06.000
Diastolic murmurs on the USMLE are almost always pathologic.

00:00:06.500 --> 00:00:12.000
Aortic regurgitation presents as an early diastolic decrescendo blowing murmur best heard at the left sternal border.
`
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            title: 'Aortic & Vascular Emergencies',
            position: 2,
            lessons: {
              create: [
                {
                  title: 'Aortic Dissection: Anatomy, Imaging & Hemodynamic Goals',
                  description: 'Step-by-step review of the false lumen, Stanford criteria, and medical management targets.',
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                  durationSec: 720,
                  position: 1,
                  relatedTopic: 'Aortic Diseases',
                  captions: {
                    create: [
                      {
                        language: 'en',
                        label: 'English',
                        fileUrl: '/captions/aortic_dissection.vtt',
                        content: `WEBVTT

00:00:01.000 --> 00:00:06.000
Aortic dissection requires immediate diagnostic clarity and targeted hemodynamic control.

00:00:06.500 --> 00:00:14.000
Remember the hemodynamic goal: heart rate under 60 bpm and systolic blood pressure under 120 mmHg using intravenous beta-blockers.
`
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seed completed successfully!');
  console.log(`- Articles created/updated: ${articleDissection.slug}, ${articleEndocarditis.slug}`);
  console.log(`- ReadyDeck: ${deck1.title}`);
  console.log(`- Video Course: ${courseCardio.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
