// netlify/functions/gemini.js
exports.handler = async function (event) {
    // CORS preflight 요청 처리
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: ''
        };
    }
    
    // POST 요청만 허용
    if (event.httpMethod !== 'POST') {
         return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        console.log("Function started");
        console.log("Event body:", event.body ? "Present" : "Missing");
        
        const { base64ImageData } = JSON.parse(event.body);
        console.log("Base64 image data length:", base64ImageData ? base64ImageData.length : "Missing");
        
        // Netlify 환경 변수에서 API 키를 가져옴
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("API Key present:", apiKey ? "Yes" : "No");

        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in Netlify environment variables.");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "서버 설정에 오류가 있습니다. 관리자에게 문의하세요." })
            };
        }
        if (!base64ImageData) {
            return { statusCode: 400, body: JSON.stringify({ error: "이미지 데이터가 전송되지 않았습니다." }) };
        }

        // Gemini 1.5 Flash 사용 (무료 플랜 호환)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const systemPrompt = `너는 수학 교육 전문가야. 이미지 속 수학 문제를 정확하고 상세하게 풀어줘.

**핵심 지침:**
1. 모든 계산 단계를 명확히 보여줘
2. 수학 수식은 LaTeX 형식 사용 (예: $x^2 + 2x + 1 = 0$)
3. 각 단계의 이유를 간단히 설명
4. 최종 답을 다시 한 번 확인

**응답 형식:**

**문제 번호:** (문제 번호)

**문제 분석:** 
- 단원: (어떤 단원인지)
- 핵심 개념: (주요 개념들)

**풀이 과정:**
1단계: (첫 번째 단계)
2단계: (두 번째 단계)
... (계속)

**정답:** (최종 정답)

**추가 코멘트:** 
- 유사 문제 유형
- 주의사항`;
        
        const payload = {
            contents: [{
                parts: [
                    { text: systemPrompt },
                    { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                topK: 32,
                topP: 1,
                maxOutputTokens: 2048,  // 무료 플랜에 맞게 조정
            }
        };

        console.log("Sending request to Gemini API...");
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log("Gemini API response status:", geminiResponse.status);

        // Gemini API 요청 자체에 실패했는지 확인
        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error("Gemini API Error:", errorText);
            console.error("Response status:", geminiResponse.status);
            return {
                statusCode: geminiResponse.status,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({ 
                    error: `Gemini API 오류: ${errorText}`,
                    status: geminiResponse.status
                })
            };
        }
        
        // 일반 JSON 응답 처리
        const geminiData = await geminiResponse.json();
        console.log("Gemini API response received");
        
        const textContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textContent) {
            console.error("No text content in response:", geminiData);
            return {
                statusCode: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({ error: "AI 응답을 처리할 수 없습니다." })
            };
        }

        // 성공 응답
        console.log("Sending success response");
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ 
                success: true, 
                content: textContent 
            })
        };

    } catch (error) {
        console.error("Server function error:", error);
        console.error("Error stack:", error.stack);
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ 
                error: error.message || "서버에서 처리 중 오류가 발생했습니다.",
                details: error.stack
            })
        };
    }
};
