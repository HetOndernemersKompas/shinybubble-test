import React, { useState, useEffect } from 'react';
import { Car, Droplets, Shield, Mail, Check, X, Info, ChevronRight, Star } from 'lucide-react';

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
}

interface CoatingOption {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

interface QuoteData {
  services: string[];
  coating: string;
  email: string;
  name: string;
  phone: string;
  carType: string;
}

const OffertePaginaVoorbeeld: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCoating, setSelectedCoating] = useState<string>('none');
  const [showCoatingInfo, setShowCoatingInfo] = useState(false);
  const [showPTFEUpsell, setShowPTFEUpsell] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    carType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const serviceOptions: ServiceOption[] = [
    {
      id: 'wash-only',
      name: 'Alleen wassen',
      price: 25,
      description: 'Grondige buitenwas met hoogwaardige producten',
      icon: <Droplets className="w-6 h-6" />
    },
    {
      id: 'wash-interior',
      name: 'Wassen + interieur',
      price: 45,
      description: 'Buitenwas plus complete interieurreiniging',
      icon: <Car className="w-6 h-6" />
    },
    {
      id: 'full-detail',
      name: 'Volledige detailing',
      price: 85,
      description: 'Complete binnen- en buitenbehandeling',
      icon: <Star className="w-6 h-6" />
    }
  ];

  const coatingOptions: CoatingOption[] = [
    {
      id: 'none',
      name: 'Geen coating',
      price: 0,
      duration: '',
      description: 'Alleen de gekozen wasbehandeling'
    },
    {
      id: 'ptfe',
      name: 'PTFE Coating',
      price: 75,
      duration: '6 maanden',
      description: 'Beschermende laag voor 6 maanden glans'
    },
    {
      id: 'ceramic',
      name: 'Keramische Coating',
      price: 250,
      duration: '3 jaar',
      description: 'Premium bescherming met 3 jaar garantie'
    }
  ];

  const calculateTotal = () => {
    const serviceTotal = selectedServices.reduce((sum, serviceId) => {
      const service = serviceOptions.find(s => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
    
    const coatingPrice = coatingOptions.find(c => c.id === selectedCoating)?.price || 0;
    return serviceTotal + coatingPrice;
  };

  useEffect(() => {
    const total = calculateTotal();
    const hasWashOnly = selectedServices.includes('wash-only') && selectedServices.length === 1;
    setShowPTFEUpsell(total >= 400 && hasWashOnly && selectedCoating === 'none');
  }, [selectedServices, selectedCoating]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmitQuote = async () => {
    if (!customerData.name || !customerData.email) return;
    
    setIsSubmitting(true);
    
    const quoteData: QuoteData = {
      services: selectedServices,
      coating: selectedCoating,
      email: customerData.email,
      name: customerData.name,
      phone: customerData.phone,
      carType: customerData.carType
    };

    try {
      const response = await fetch('/wp-json/sb-offerte/v1/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData)
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error sending quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            currentStep >= step 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <ChevronRight className={`w-5 h-5 mx-2 ${
              currentStep > step ? 'text-blue-600' : 'text-gray-400'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kies je service</h2>
        <p className="text-gray-600">Selecteer de gewenste behandeling voor je auto</p>
      </div>
      
      <div className="grid gap-4">
        {serviceOptions.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceToggle(service.id)}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selectedServices.includes(service.id)
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  selectedServices.includes(service.id) ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}>
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">€{service.price}</div>
                <div className="text-sm text-gray-500">incl. BTW</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showPTFEUpsell && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Aanbeveling: PTFE Coating</h3>
          </div>
          <p className="text-yellow-700 text-sm">
            Bij een totaal van €{calculateTotal()} raden we PTFE coating aan voor langdurige bescherming!
          </p>
        </div>
      )}

      <button
        onClick={() => setCurrentStep(2)}
        disabled={selectedServices.length === 0}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        Volgende stap
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coating kiezen</h2>
        <p className="text-gray-600">Voeg extra bescherming toe aan je behandeling</p>
      </div>

      <div className="grid gap-4">
        {coatingOptions.map((coating) => (
          <div
            key={coating.id}
            onClick={() => setSelectedCoating(coating.id)}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selectedCoating === coating.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedCoating === coating.id 
                    ? 'border-blue-600 bg-blue-600' 
                    : 'border-gray-300'
                }`}>
                  {selectedCoating === coating.id && (
                    <Check className="w-2 h-2 text-white m-0.5" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{coating.name}</h3>
                  <p className="text-gray-600 text-sm">{coating.description}</p>
                  {coating.duration && (
                    <p className="text-blue-600 text-sm font-medium">Bescherming: {coating.duration}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {coating.price > 0 && (
                  <>
                    <div className="text-2xl font-bold text-blue-600">€{coating.price}</div>
                    <div className="text-sm text-gray-500">incl. BTW</div>
                  </>
                )}
                {coating.id === 'ceramic' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCoatingInfo(true);
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Info className="w-4 h-4 mr-1" />
                    Meer info
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Vorige
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Volgende stap
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Samenvatting & Contact</h2>
        <p className="text-gray-600">Controleer je keuzes en vul je gegevens in</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Je selectie:</h3>
        
        <div className="space-y-3">
          {selectedServices.map(serviceId => {
            const service = serviceOptions.find(s => s.id === serviceId);
            return service ? (
              <div key={serviceId} className="flex justify-between items-center">
                <span>{service.name}</span>
                <span className="font-semibold">€{service.price}</span>
              </div>
            ) : null;
          })}
          
          {selectedCoating !== 'none' && (
            <div className="flex justify-between items-center">
              <span>{coatingOptions.find(c => c.id === selectedCoating)?.name}</span>
              <span className="font-semibold">€{coatingOptions.find(c => c.id === selectedCoating)?.price}</span>
            </div>
          )}
          
          <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
            <span>Totaal (incl. BTW):</span>
            <span className="text-blue-600">€{calculateTotal()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Naam *
          </label>
          <input
            type="text"
            value={customerData.name}
            onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mailadres *
          </label>
          <input
            type="email"
            value={customerData.email}
            onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefoonnummer
          </label>
          <input
            type="tel"
            value={customerData.phone}
            onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auto type/merk
          </label>
          <input
            type="text"
            value={customerData.carType}
            onChange={(e) => setCustomerData(prev => ({ ...prev, carType: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="bijv. BMW 3-serie, Volkswagen Golf"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Vorige
        </button>
        <button
          onClick={handleSubmitQuote}
          disabled={!customerData.name || !customerData.email || isSubmitting}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Mail className="w-5 h-5 mr-2" />
              Offerte versturen
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Offerte verstuurd!</h2>
        <p className="text-gray-600">
          Je offerte is succesvol verstuurd naar {customerData.email}. 
          We nemen binnen 24 uur contact met je op.
        </p>
      </div>
      <button
        onClick={() => {
          setCurrentStep(1);
          setSelectedServices([]);
          setSelectedCoating('none');
          setCustomerData({ name: '', email: '', phone: '', carType: '' });
          setSubmitSuccess(false);
        }}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Nieuwe offerte maken
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shiny Bubble</h1>
          <p className="text-gray-600">Professionele autodetailing</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep < 4 && renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderSuccess()}
        </div>
      </div>

      {/* Coating Info Modal */}
      {showCoatingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Keramische Coating</h3>
              <button
                onClick={() => setShowCoatingInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Keramische coating biedt de beste bescherming voor je auto:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>3 jaar garantie op glans en bescherming</li>
                <li>Hydrofobe eigenschappen - water parelt af</li>
                <li>UV-bescherming tegen verkleuring</li>
                <li>Makkelijker schoon te houden</li>
                <li>Krasbestendig oppervlak</li>
              </ul>
              <p className="font-medium text-blue-600">
                Investering die zichzelf terugverdient door minder onderhoud!
              </p>
            </div>
            <button
              onClick={() => setShowCoatingInfo(false)}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffertePaginaVoorbeeld;