export const determineProductSegment = (composition: string): string => {
  const comp = composition.toLowerCase();

  if (comp.includes('amoxicillin') || comp.includes('cefixime') || comp.includes('azithromycin') || comp.includes('clavulanate') || comp.includes('cefuroxime')) {
    return 'Antibiotic';
  }
  if (comp.includes('paracetamol') || comp.includes('diclofenac') || comp.includes('aceclofenac') || comp.includes('ibuprofen')) {
    return 'Analgesic / Antipyretic';
  }
  if (comp.includes('pantoprazole') || comp.includes('rabeprazole') || comp.includes('omeprazole') || comp.includes('domperidone')) {
    return 'Gastrointestinal';
  }
  if (comp.includes('vitamin') || comp.includes('calcium') || comp.includes('zinc') || comp.includes('iron') || comp.includes('multivitamin') || comp.includes('methylcobalamin')) {
    return 'Nutritional / Supplement';
  }
  if (comp.includes('cetirizine') || comp.includes('levocetirizine') || comp.includes('montelukast')) {
    return 'Anti-allergic / Antihistamine';
  }
  if (comp.includes('amlodipine') || comp.includes('telmisartan') || comp.includes('losartan') || comp.includes('rosuvastatin') || comp.includes('atorvastatin')) {
    return 'Cardiovascular';
  }
  if (comp.includes('metformin') || comp.includes('glimepiride') || comp.includes('gliclazide')) {
    return 'Anti-diabetic';
  }
  if (comp.includes('chlorhexidine') || comp.includes('povidone')) {
    return 'Antiseptic';
  }
  if (comp.includes('salbutamol') || comp.includes('budesonide') || comp.includes('formoterol') || comp.includes('levosalbutamol')) {
    return 'Respiratory';
  }

  // Default fallback if no match is found
  return 'General';
};
