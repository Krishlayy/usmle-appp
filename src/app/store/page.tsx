import { prisma } from '@/lib/db';
import { getCachedOrFetch } from '@/lib/redis';
import StoreClient, { QBankItem } from './StoreClient';

export const revalidate = 60;

const DEFAULT_QBANKS: QBankItem[] = [
  {
    id: 'qbank_autoimmune',
    slug: 'autoimmune-diseases',
    title: 'Autoimmune Diseases Q-Bank',
    specialtyTag: 'Immunology / Rheumatology',
    totalQuestions: 50,
    price: 2900,
    description: 'Master SLE, Rheumatoid Arthritis, Scleroderma, and HLA associations with high-yield distractor analysis and clinical recall mnemonics.',
  },
  {
    id: 'qbank_immunodeficiency',
    slug: 'immunodeficiency-disorders',
    title: 'Immunodeficiency Disorders Q-Bank',
    specialtyTag: 'Immunology / Genetics',
    totalQuestions: 50,
    price: 2900,
    description: 'SCID, Bruton Agammaglobulinemia, CVID, DiGeorge Syndrome, and complement deficiencies thoroughly mapped to visual memory anchors.',
  },
  {
    id: 'qbank_biologics',
    slug: 'biologics-and-their-targets',
    title: 'Biologics & Targeted Therapeutics',
    specialtyTag: 'Pharmacology / Oncology',
    totalQuestions: 50,
    price: 2900,
    description: 'Monoclonal antibodies, TNF inhibitors, checkpoint inhibitors, and receptor antagonists with precise clinical indication mechanisms.',
  },
  {
    id: 'qbank_histology',
    slug: 'approach-to-histology',
    title: 'Approach to Histology',
    specialtyTag: 'Pathology / Histology',
    totalQuestions: 50,
    price: 4900,
    description: 'High-power biopsies, glomeruli lesions, granulomas, Mallory bodies, and pathognomonic staining patterns for Step 1.',
  },
  {
    id: 'qbank_vasculitis',
    slug: 'rheumatology-vasculitis',
    title: 'Rheumatology & Vasculitis Q-Bank',
    specialtyTag: 'Pathology / Rheumatology',
    totalQuestions: 50,
    price: 2900,
    description: 'Large, medium, and small vessel vasculitides, ANCA associations, Temporal Arteritis, Kawasaki, and Granulomatosis with Polyangiitis.',
  },
];

export default async function StorePage() {
  const dbQBanks = await getCachedOrFetch(
    'qbanks:storefront:active',
    async () => {
      try {
        const banks = await prisma.qBank.findMany({
          where: { isActive: true },
          orderBy: { title: 'asc' },
        });
        return banks;
      } catch (error) {
        console.warn('Database unreachable, returning empty QBank list during build/fetch', error);
        return [];
      }
    },
    60
  );

  const initialQBanks: QBankItem[] = dbQBanks && dbQBanks.length > 0
    ? dbQBanks.map(b => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        specialtyTag: b.specialtyTag,
        description: b.description,
        price: b.price,
        totalQuestions: b.totalQuestions,
        difficulty: b.difficulty,
      }))
    : DEFAULT_QBANKS;

  return <StoreClient initialQBanks={initialQBanks} />;
}
