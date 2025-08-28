// netlify/functions/gemini.js
const fetch = require('node-fetch');

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

        // 스트리밍 엔드포인트 사용 (더 빠른 응답)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${apiKey}`;
        
        const systemPrompt = `너는 수학 문제 풀이 전문가야. 이미지 속 문제를 읽고, 다음 마크다운 형식에 맞춰서 답변해 줘. 수학 수식은 LaTeX 형식으로 작성해 줘:

**문제 번호:** (문제 번호)

**문제 분석:** (어떤 단원의 어떤 개념을 사용하는지, 핵심 조건은 무엇인지 요약)

**풀이 과정:** (단계별로 상세하고 논리적인 풀이 과정을 서술, 수식은 $수식$ 형태로 작성)

**정답:** (최종 정답)

**추가 코멘트:** (유사 문제 유형, 학생들이 자주 하는 실수, 추가적으로 학습하면 좋은 개념 등을 제안)`;
        
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
                maxOutputTokens: 2048,
            }
        };

        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Gemini API 요청 자체에 실패했는지 확인
        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error("Gemini API Error:", errorText);
            console.error("Response status:", geminiResponse.status);
            console.error("Response headers:", geminiResponse.headers);
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
        
        // 스트리밍 응답 처리
        const reader = geminiResponse.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;
                        
                        try {
                            const parsed = JSON.parse(data);
                            const textContent = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (textContent) {
                                fullText += textContent;
                            }
                        } catch (e) {
                            // JSON 파싱 오류 무시 (부분 데이터)
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
        
        if (!fullText) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "AI 응답을 처리할 수 없습니다." })
            };
        }

        // 성공 응답
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ 
                success: true, 
                content: fullText 
            })
        };

    } catch (error) {
        console.error("Server function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || "서버에서 처리 중 오류가 발생했습니다." })
        };
    }
};
