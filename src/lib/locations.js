// Bangladesh administrative hierarchy
// Division -> District -> Upazila -> Union -> Village
// Upazila lists are comprehensive (all 64 districts). Unions/villages are
// representative: real names where known, generated otherwise, so every
// level of the selector stays functional.

const UNION_OVERRIDES = {
  "Dhamrai": ["Kashimpur", "Bhasa", "Dhamrai Sadar"],
  "Savar": ["Savar", "Bhadrasan", "Dhamsona"],
  "Dohar": ["Dohar", "Nababpur", "Kumarbhog"],
  "Anwara": ["Anwara", "Barakhain", "Banshkhali"],
  "Sitakunda": ["Sitakunda", "Bhatiary", "Muradpur"],
  "Mirsharai": ["Mirsharai", "Zorarganj", "Mayani"],
  "Paba": ["Paba", "Haragram", "Katakhali"],
  "Durgapur": ["Durgapur", "Baneshwar", "Marufpur"],
  "Dumuria": ["Dumuria", "Gollamari", "Shahidbagh"],
  "Batiaghata": ["Batiaghata", "Surkhali", "Jogipole"],
  "Barishal Sadar": ["Barishal", "Bamrail", "Kawnia"],
  "Babuganj": ["Babuganj", "Madhabpasha", "Rahmatpur"],
  "Sylhet Sadar": ["Sylhet", "Moglabazar", "Tuker Bazar"],
  "Rangpur Sadar": ["Rangpur", "Pirgachha", "Mithapukur"],
  "Mymensingh Sadar": ["Mymensingh", "Muktagachha", "Trishal"]
};

const VILLAGE_OVERRIDES = {
  "Dhamrai": ["Bhailan", "Chandrapur", "Kashimpur Bazar"],
  "Savar": ["Ganda", "Rajashan", "Nobinagar"],
  "Dohar": ["Nababpur Bazar", "Mausa", "Chakbazar"],
  "Anwara": ["Anwara Bazar", "Gochra", "Kaliais"],
  "Sitakunda": ["Sitakunda Bazar", "Kumira", "Salimpur"],
  "Mirsharai": ["Mirsharai Bazar", "Mayani Bazar", "Baroiyadhala"],
  "Paba": ["Paba Bazar", "Haripur", "Katakhali Bazar"],
  "Durgapur": ["Durgapur Bazar", "Baneshwar Bazar", "Aruail"],
  "Dumuria": ["Dumuria Bazar", "Gollamari", "Aronghata"],
  "Batiaghata": ["Batiaghata Bazar", "Surkhali Bazar", "Jogipole Bazar"],
  "Barishal Sadar": ["Barishal Bazar", "Bamrail Bazar", "Kawnia Bazar"],
  "Babuganj": ["Babuganj Bazar", "Madhabpasha Bazar", "Rahmatpur Bazar"],
  "Sylhet Sadar": ["Zindabazar", "Moglabazar Bazar", "Tuker Bazar"],
  "Rangpur Sadar": ["Rangpur Bazar", "Pirgachha Bazar", "Mithapukur Bazar"],
  "Mymensingh Sadar": ["Mymensingh Bazar", "Muktagachha Bazar", "Trishal Bazar"]
};

function genUnions(upazila) {
  if (UNION_OVERRIDES[upazila]) return UNION_OVERRIDES[upazila];
  return [`${upazila} Sadar`, `${upazila} Bazar`, `Uttar ${upazila}`, `Dakshin ${upazila}`];
}
function genVillages(upazila) {
  if (VILLAGE_OVERRIDES[upazila]) return VILLAGE_OVERRIDES[upazila];
  return [`${upazila} Bazar`, `${upazila} Gram`, `${upazila} Par`, `Naya ${upazila}`];
}

export const LOCATIONS = {
  "Dhaka": {
    districts: {
      "Dhaka": ["Dhamrai", "Savar", "Dohar", "Nawabganj", "Keraniganj"],
      "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
      "Narayanganj": ["Narayanganj Sadar", "Araihazar", "Bandar", "Sonargaon", "Rupganj"],
      "Narsingdi": ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"],
      "Tangail": ["Tangail Sadar", "Bhuapur", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Basail", "Delduar"],
      "Faridpur": ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
      "Manikganj": ["Manikganj Sadar", "Daulatpur", "Ghior", "Harirampur", "Saturia", "Shivalaya", "Singair"],
      "Gopalganj": ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
      "Rajbari": ["Rajbari Sadar", "Baliakandi", "Goalandaghat", "Pangsha", "Kalukhali"],
      "Madaripur": ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"],
      "Shariatpur": ["Shariatpur Sadar", "Bhedarganj", "Damudya", "Gosairhat", "Naria", "Zanjira"],
      "Kishoreganj": ["Kishoreganj Sadar", "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"]
    }
  },
  "Chattogram": {
    districts: {
      "Chattogram": ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Karnaphuli", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"],
      "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Maheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhia"],
      "Comilla": ["Comilla Sadar", "Comilla Adarsha Sadar", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Meghna", "Monohorganj", "Muradnagar", "Nangalkot", "Titas"],
      "Brahmanbaria": ["Brahmanbaria Sadar", "Akhaura", "Bancharampur", "Bijoynagar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail", "Ashuganj"],
      "Chandpur": ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"],
      "Lakshmipur": ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamolnagar"],
      "Noakhali": ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Senbagh", "Sonaimuri", "Subarnachar"],
      "Feni": ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Fulgazi", "Parshuram", "Sonagazi"],
      "Khagrachhari": ["Khagrachhari Sadar", "Dighinala", "Lakshmichari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"],
      "Rangamati": ["Rangamati Sadar", "Bilaichari", "Barkal", "Juraichari", "Belaichari", "Kaptai", "Kawkhali", "Naniarchar", "Rajasthali", "Sajek"],
      "Bandarban": ["Bandarban Sadar", "Ali Kadam", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"]
    }
  },
  "Rajshahi": {
    districts: {
      "Rajshahi": ["Paba", "Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Puthia", "Tanore"],
      "Natore": ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Singra"],
      "Naogaon": ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mahadebpur", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
      "Nawabganj": ["Chapai Nawabganj Sadar", "Bholahat", "Gomastapur", "Nachole", "Shibganj"],
      "Pabna": ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"],
      "Sirajganj": ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Tarash", "Ullahpara"],
      "Bogura": ["Bogura Sadar", "Adamdighi", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"],
      "Joypurhat": ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"]
    }
  },
  "Khulna": {
    districts: {
      "Khulna": ["Khulna Sadar", "Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Terokhada"],
      "Jessore": ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
      "Satkhira": ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"],
      "Bagerhat": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
      "Magura": ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
      "Jhenaidah": ["Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
      "Narail": ["Narail Sadar", "Kalia", "Lohagara"],
      "Chuadanga": ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
      "Meherpur": ["Meherpur Sadar", "Gangni", "Mujibnagar"]
    }
  },
  "Barishal": {
    districts: {
      "Barishal": ["Barishal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur", "Uzirpur"],
      "Barguna": ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali"],
      "Patuakhali": ["Patuakhali Sadar", "Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali"],
      "Bhola": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
      "Pirojpur": ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"],
      "Jhalokati": ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"]
    }
  },
  "Sylhet": {
    districts: {
      "Sylhet": ["Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshin Surma", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmani Nagar", "South Surma", "Zakiganj"],
      "Habiganj": ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj", "Shaistaganj"],
      "Moulvibazar": ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"],
      "Sunamganj": ["Sunamganj Sadar", "Bishwamvarpur", "Chhatak", "Dakshin Sunamganj", "Derai", "Dharampasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sulla", "Tahirpur"]
    }
  },
  "Rangpur": {
    districts: {
      "Rangpur": ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
      "Dinajpur": ["Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
      "Kurigram": ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Phulbari", "Rajarhat", "Raumari", "Ulipur", "Nageshwari"],
      "Gaibandha": ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
      "Nilphamari": ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"],
      "Panchagarh": ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],
      "Thakurgaon": ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"],
      "Lalmonirhat": ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"]
    }
  },
  "Mymensingh": {
    districts: {
      "Mymensingh": ["Mymensingh Sadar", "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail", "Phulpur", "Trishal", "Tarakanda"],
      "Jamalpur": ["Jamalpur Sadar", "Bakshiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"],
      "Netrokona": ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri", "Madan", "Mohanganj", "Purbadhala"],
      "Sherpur": ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"]
    }
  }
};

export const DIVISIONS = Object.keys(LOCATIONS);

export function getDistricts(division) {
  return division && LOCATIONS[division] ? Object.keys(LOCATIONS[division].districts) : [];
}
export function getUpazilas(division, district) {
  if (!division || !district) return [];
  return LOCATIONS[division]?.districts[district] || [];
}
export function getUnions(division, district, upazila) {
  if (!upazila) return [];
  return genUnions(upazila);
}
export function getVillages(division, district, upazila, union) {
  if (!upazila) return [];
  return genVillages(upazila);
}

export const CATEGORY_META = {
  rice: { label: "Rice", label_bn: "চাল", icon: "Wheat", color: "#D97706" },
  fish: { label: "Fish", label_bn: "মাছ", icon: "Fish", color: "#0284C7" },
  vegetables: { label: "Vegetables", label_bn: "শাকসবজি", icon: "Carrot", color: "#16A34A" },
  poultry: { label: "Poultry", label_bn: "মুরগি", icon: "Egg", color: "#DC2626" },
  fruits: { label: "Fruits", label_bn: "ফল", icon: "Apple", color: "#9333EA" },
  spices: { label: "Spices", label_bn: "মসলা", icon: "Flame", color: "#EA580C" },
  other: { label: "Other", label_bn: "অন্যান্য", icon: "ShoppingBasket", color: "#475569" }
};

export const UNIT_META = {
  kg: { label: "kg", label_bn: "কেজি" },
  gram: { label: "gm", label_bn: "গ্রাম" },
  liter: { label: "L", label_bn: "লিটার" },
  piece: { label: "pc", label_bn: "পিস" },
  dozen: { label: "dz", label_bn: "ডজন" },
  maund: { label: "maund", label_bn: "মন" }
};

export const DAY_NAMES = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const DAY_NAMES_BN = {
  Saturday: "শনিবার", Sunday: "রবিবার", Monday: "সোমবার", Tuesday: "মঙ্গলবার",
  Wednesday: "বুধবার", Thursday: "বৃহস্পতিবার", Friday: "শুক্রবার"
};