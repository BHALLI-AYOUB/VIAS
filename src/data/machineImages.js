import alimentateurImage from '../../Alimentateur.jfif';
import autobetonniereImage from '../../AUTOBÉTONNIÈRE.jpg.jpeg';
import bobcatImage from '../../Bobca.jpeg';
import chargeuseImage from '../../CHARGEUSE SUR PNEUS.webp';
import compacteurEnrobesImage from "../../COMPACTEUR   D'ENROBÉS.jpg.jpeg";
import rouleauPneusImage from '../../COMPACTEUR A PNEUS.webp';
import compacteurTerrassementImage from '../../COMPACTEUR TERASSEMENT.jpg.jpeg';
import finisseurImage from '../../FINISSEUR.jpg.jpeg';
import miniPelleImage from '../../MINI PELLE.webp';
import niveleuseImage from '../../NIVELEUSE.webp';
import pelleChenillesImage from '../../PELLE CHENILLES.jpg.jpeg';
import pellePneusImage from '../../PELLE PNEUS.jpg.jpeg';
import raboteuseImage from '../../RABOTEUSE.jpg.jpeg';
import tractoPelleImage from '../../TRACTO PELLE.webp';

export const machineImages = {
  'ALIMENTATEUR SUR CHENILLES': alimentateurImage,
  'AUTOBÉTONNIÈRE': autobetonniereImage,
  BOBCAT: bobcatImage,
  'CHARGEUSE SUR PNEUS': chargeuseImage,
  "COMPACTEUR D'ENROBÉS": compacteurEnrobesImage,
  'COMPACTEUR TERRASSEMENT': compacteurTerrassementImage,
  FINISSEUR: finisseurImage,
  'MINI PELLE': miniPelleImage,
  NIVELEUSE: niveleuseImage,
  'PELLE CHENILLES': pelleChenillesImage,
  'PELLE PNEUS': pellePneusImage,
  RABOTEUSE: raboteuseImage,
  'ROULEAU A PNEUS': rouleauPneusImage,
  'TRACTO-PELLE': tractoPelleImage,
};

export function getMachineImage(category) {
  return machineImages[category] || null;
}
