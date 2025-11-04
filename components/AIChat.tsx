"use client";
import { useState, useRef, useEffect } from "react";
import { AffButton } from "./AffButton";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  parts?: Array<{
    name: string;
    category: string;
    description: string;
    partNumbers: string[];
  }>;
}

interface Vehicle {
  model: string;
  generation: string;
  yearRange: string;
  engineCode: string;
  bodyCode: string;
  commonParts: Array<{
    name: string;
    category: string;
    partNumbers: string[];
    description: string;
  }>;
}

type ChatState = 'asking_part' | 'asking_vehicle' | 'showing_results';

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'こんにちは！🚗 何をお探しですか？\n\n例：オイルフィルター、エアフィルター、ブレーキパッドなど'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('asking_part');
  const [userPart, setUserPart] = useState("");
  const [userVehicle, setUserVehicle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findVehicleByCode = async (code: string): Promise<Vehicle | null> => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      
      const vehicle = data.vehicles.find((v: Vehicle) => 
        v.engineCode.toLowerCase().includes(code.toLowerCase()) ||
        v.bodyCode.toLowerCase().includes(code.toLowerCase()) ||
        v.model.toLowerCase().includes(code.toLowerCase())
      );
      
      return vehicle || null;
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      return null;
    }
  };

  const findPartsByVehicleAndPart = async (vehicleName: string, partName: string) => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      
      const vehicle = data.vehicles.find((v: Vehicle) => 
        v.model.toLowerCase().includes(vehicleName.toLowerCase())
      );
      
      if (!vehicle) return null;
      
      // 部品名でフィルタリング
      const matchingParts = vehicle.commonParts.filter((part: { name: string; category: string; partNumbers: string[]; description: string }) => 
        part.name.toLowerCase().includes(partName.toLowerCase()) ||
        part.description.toLowerCase().includes(partName.toLowerCase())
      );
      
      return {
        vehicle,
        parts: matchingParts
      };
    } catch (error) {
      console.error('Error fetching parts data:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    // AI応答をシミュレート
    setTimeout(async () => {
      let aiResponse: Message;
      
      if (chatState === 'asking_part') {
        setUserPart(currentInput);
        setChatState('asking_vehicle');
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `「${currentInput}」ですね！\n\nどんな車ですか？\n\n例：プリウス、アクア、ヴォクシーなど`
        };
      } else if (chatState === 'asking_vehicle') {
        setUserVehicle(currentInput);
        setChatState('showing_results');
        
        const result = await findPartsByVehicleAndPart(currentInput, userPart);
        
        if (result && result.parts.length > 0) {
          aiResponse = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `「${result.vehicle.model} ${result.vehicle.generation}（${result.vehicle.yearRange}）」の「${userPart}」ですね！\n\nお車に合う部品をご紹介します：`,
            parts: result.parts
          };
        } else {
          aiResponse = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `申し訳ございません。「${currentInput}」の「${userPart}」が見つかりませんでした。\n\n別の車種名や部品名をお試しください。`
          };
        }
      } else {
        // リセット
        setChatState('asking_part');
        setUserPart("");
        setUserVehicle("");
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: '何をお探しですか？\n\n例：オイルフィルター、エアフィルター、ブレーキパッドなど'
        };
      }

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-white rounded-2xl shadow-lg">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
        <h1 className="text-xl font-bold">🚗 AIパーツナビ</h1>
        <p className="text-sm opacity-90">部品名と車種を教えてください。お車に合う部品をお探しします</p>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* 部品リスト */}
              {message.parts && message.parts.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.parts.map((part, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <h4 className="font-semibold text-gray-800">{part.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{part.description}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        部品番号: {part.partNumbers.join(', ')}
                      </p>
                      <AffButton 
                        mall="yorost" 
                        brand="YORO STORE" 
                        query={`${message.content.split('」')[0].replace('「', '')} ${part.name}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              chatState === 'asking_part' 
                ? "部品名を入力してください（例：オイルフィルター、エアフィルター）"
                : chatState === 'asking_vehicle'
                ? "車種名を入力してください（例：プリウス、アクア、ヴォクシー）"
                : "何かお手伝いできることはありますか？"
            }
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
}
