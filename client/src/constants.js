import { ADMIN_EMAIL } from './config';

export const DISCLAIMER_SHORT =
  'A student-run community project, not officially operated by IITP. Items are posted by users and unverified.';

export const DISCLAIMER_POINTS = [
  {
    title: 'Not an official service',
    text: 'This platform is a student-run community project. It is not operated by, affiliated with, or endorsed by IIT Patna, and no institute representative reviews posts.',
  },
  {
    title: 'Items and posts are unverified',
    text: 'Every listing, photo and description is submitted by a user. We do not verify ownership, condition, or whether an item actually exists.',
  },
  {
    title: 'Exchange at your own risk',
    text: 'Meet in public, well-lit places and confirm the item before handing anything over. This app and the institute are not responsible for losses, damage, or disputes between users.',
  },
  {
    title: 'Report misleading or harmful posts',
    text: `Report fraudulent, misleading, or inappropriate posts to ${ADMIN_EMAIL} and they may be removed.`,
  },
];
