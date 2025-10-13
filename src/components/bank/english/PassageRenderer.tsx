'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Edit3 } from 'lucide-react';
import { EnglishContentRenderer } from '@/components/EnglishContentRenderer';
import { EnglishPassage } from '@/types/english';

interface EditFormData {
  question_text?: string;
  question_type?: string;
  question_subject?: string;
  question_difficulty?: string;
  question_detail_type?: string;
  question_choices?: string[];
  correct_answer?: string;
  explanation?: string;
  learning_point?: string;
  example_content?: string;
  passage_content?: any;
  original_content?: any;
  korean_translation?: any;
}

interface PassageRendererProps {
  passage: EnglishPassage;
  showAnswerSheet: boolean;
  editingPassageId: number | null;
  editFormData: EditFormData;
  isLoading: boolean;
  onStartEdit: (passage: EnglishPassage) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEditFormDataChange: (data: EditFormData) => void;
}

export const PassageRenderer: React.FC<PassageRendererProps> = ({
  passage,
  showAnswerSheet,
  editingPassageId,
  editFormData,
  isLoading,
  onStartEdit,
  onSave,
  onCancelEdit,
  onEditFormDataChange,
}) => {

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            📖 지문 {passage.related_questions && passage.related_questions.length > 1 ? `(문제 ${passage.related_questions[0]}-${passage.related_questions[passage.related_questions.length - 1]})` : passage.related_questions?.[0] ? `(문제 ${passage.related_questions[0]})` : ''}
          </span>
        </div>
        <div className="flex gap-1">
          {editingPassageId === passage.passage_id ? (
            <>
              <Button
                onClick={onSave}
                disabled={isLoading}
                size="sm"
                className="bg-green-600 hover:bg-green-700 p-1"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                onClick={onCancelEdit}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onStartEdit(passage)}
              size="sm"
              variant="ghost"
              className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF] p-1"
              title="지문 편집"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

        {/* Metadata rendering for correspondence and review */}
        {passage.passage_content?.metadata && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            {passage.passage_content.metadata.sender && (
              <div><span className="font-semibold">From:</span> {passage.passage_content.metadata.sender}</div>
            )}
            {passage.passage_content.metadata.recipient && (
              <div><span className="font-semibold">To:</span> {passage.passage_content.metadata.recipient}</div>
            )}
            {passage.passage_content.metadata.subject && (
              <div><span className="font-semibold">Subject:</span> {passage.passage_content.metadata.subject}</div>
            )}
            {passage.passage_content.metadata.date && (
              <div><span className="font-semibold">Date:</span> {passage.passage_content.metadata.date}</div>
            )}
            {passage.passage_content.metadata.participants && (
              <div><span className="font-semibold">Participants:</span> {passage.passage_content.metadata.participants.join(', ')}</div>
            )}
            {passage.passage_content.metadata.rating && (
              <div><span className="font-semibold">Rating:</span> {'★'.repeat(passage.passage_content.metadata.rating)}</div>
            )}
            {passage.passage_content.metadata.product_name && (
              <div><span className="font-semibold">Product:</span> {passage.passage_content.metadata.product_name}</div>
            )}
            {passage.passage_content.metadata.reviewer && (
              <div><span className="font-semibold">Reviewer:</span> {passage.passage_content.metadata.reviewer}</div>
            )}
          </div>
        )}

        {editingPassageId === passage.passage_id ? (
          <div className="space-y-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-3">지문 편집 (구조 유지 필수)</div>

            {/* 메타데이터 편집 */}
            {editFormData.passage_content?.metadata && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">메타데이터</div>
                {Object.entries(editFormData.passage_content.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="w-20 text-xs text-gray-600">{key}:</label>
                    <Input
                      value={value as string}
                      onChange={(e) => {
                        const newData = {...editFormData};
                        newData.passage_content.metadata[key] = e.target.value;
                        onEditFormDataChange(newData);
                      }}
                      className="flex-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 내용 편집 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">내용</div>

              {/* 새로운 데이터 구조 편집: { title, paragraphs } 형식 */}
              {(editFormData.passage_content?.title !== undefined || editFormData.passage_content?.paragraphs) ? (
                <div className="space-y-4">
                  {/* 제목 편집 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">제목</label>
                    <Input
                      value={editFormData.passage_content?.title || ''}
                      onChange={(e) => {
                        const newData = {...editFormData};
                        if (!newData.passage_content) newData.passage_content = {};
                        newData.passage_content.title = e.target.value;
                        onEditFormDataChange(newData);
                      }}
                      placeholder="지문 제목을 입력하세요"
                      className="w-full"
                    />
                  </div>

                  {/* 문단 편집 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">문단</label>
                    <div className="space-y-2">
                      {(editFormData.passage_content?.paragraphs || ['']).map((paragraph: string, idx: number) => (
                        <div key={idx} className="relative">
                          <Textarea
                            value={paragraph}
                            onChange={(e) => {
                              const newData = {...editFormData};
                              if (!newData.passage_content) newData.passage_content = {};
                              if (!newData.passage_content.paragraphs) newData.passage_content.paragraphs = [''];
                              newData.passage_content.paragraphs[idx] = e.target.value;
                              onEditFormDataChange(newData);
                            }}
                            placeholder={`${idx + 1}번째 문단을 입력하세요`}
                            rows={3}
                            className="w-full text-sm"
                          />
                          {editFormData.passage_content?.paragraphs && editFormData.passage_content.paragraphs.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                              onClick={() => {
                                const newData = {...editFormData};
                                if (newData.passage_content?.paragraphs) {
                                  newData.passage_content.paragraphs.splice(idx, 1);
                                  onEditFormDataChange(newData);
                                }
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}

                      {/* 문단 추가 버튼 */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const newData = {...editFormData};
                          if (!newData.passage_content) newData.passage_content = {};
                          if (!newData.passage_content.paragraphs) newData.passage_content.paragraphs = [];
                          newData.passage_content.paragraphs.push('');
                          onEditFormDataChange(newData);
                        }}
                      >
                        + 문단 추가
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 기존 구조화된 형식 편집: { content: [...] } */
                editFormData.passage_content?.content?.map((item: any, idx: number) => (
                  <div key={idx} className="p-2 border border-gray-200 rounded">
                    <div className="text-xs text-gray-500 mb-1">타입: {item.type}</div>
                    {item.value !== undefined && (
                      <Textarea
                        value={item.value}
                        onChange={(e) => {
                          const newData = {...editFormData};
                          newData.passage_content.content[idx].value = e.target.value;
                          onEditFormDataChange(newData);
                        }}
                        rows={item.type === 'title' ? 1 : 3}
                        className="w-full text-sm"
                      />
                    )}
                    {item.items && (
                      <div className="space-y-1">
                        {item.items.map((listItem: string, listIdx: number) => (
                          <Input
                            key={listIdx}
                            value={listItem}
                            onChange={(e) => {
                              const newData = {...editFormData};
                              newData.passage_content.content[idx].items[listIdx] = e.target.value;
                              onEditFormDataChange(newData);
                            }}
                            className="text-sm"
                            placeholder={`항목 ${listIdx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                    {item.speaker && item.line && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={item.speaker}
                          onChange={(e) => {
                            const newData = {...editFormData};
                            newData.passage_content.content[idx].speaker = e.target.value;
                            onEditFormDataChange(newData);
                          }}
                          placeholder="화자"
                          className="text-sm"
                        />
                        <Input
                          value={item.line}
                          onChange={(e) => {
                            const newData = {...editFormData};
                            newData.passage_content.content[idx].line = e.target.value;
                            onEditFormDataChange(newData);
                          }}
                          placeholder="대사"
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {/* 지문 내용 렌더링 디버깅 */}
            {(() => {
              const contentToShow = showAnswerSheet ? passage.original_content : passage.passage_content;
              return null;
            })()}

            {/* 정답지 모드일 때는 원본 내용 표시, 아니면 학생용 내용 표시 */}
            {(() => {
              const contentToShow = showAnswerSheet ? passage.original_content : passage.passage_content;

              // 새로운 데이터 구조 처리: { title, paragraphs } 형식
              if (contentToShow?.title || contentToShow?.paragraphs) {
                return (
                  <div>
                    {/* 제목 렌더링 */}
                    {contentToShow.title && (
                      <h4 className="font-bold text-gray-900 mb-3">{contentToShow.title}</h4>
                    )}

                    {/* 문단 렌더링 */}
                    {contentToShow.paragraphs && contentToShow.paragraphs.map((paragraph: string, idx: number) => (
                      <div key={idx} className="mb-3">
                        <EnglishContentRenderer
                          content={paragraph}
                          className="text-gray-800 leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                );
              }

              // 기존 데이터 구조 처리: { content: [...] } 형식
              const contentArray = contentToShow?.content;

              if (!contentArray || contentArray.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-lg mb-2">📄</div>
                    <div>지문 내용이 없습니다</div>
                    <div className="text-sm mt-1">passage_content가 비어있거나 잘못된 형식입니다</div>
                  </div>
                );
              }

              return contentArray.map((item: any, idx: number) => (
              <div key={idx} className="mb-2">
                {item.type === 'title' && (
                  <h4 className="font-bold text-gray-900">{item.value}</h4>
                )}
                {item.type === 'paragraph' && (
                  <EnglishContentRenderer
                    content={item.value}
                    className="text-gray-800 leading-relaxed"
                  />
                )}
                {item.type === 'list' && item.items && (
                  <ul className="list-disc list-inside">
                    {item.items.map((listItem: string, listIdx: number) => (
                      <li key={listIdx} className="text-gray-800">{listItem}</li>
                    ))}
                  </ul>
                )}
                {item.type === 'key_value' && item.pairs && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {item.pairs.map((pair: { key: string; value: string }, pairIdx: number) => (
                      <div key={pairIdx} className="flex justify-between py-1">
                        <span className="font-semibold text-gray-700">{pair.key}:</span>
                        <span className="text-gray-800">{pair.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {item.speaker && item.line && (
                  <div className="dialogue-line mb-2">
                    <span className="font-semibold text-blue-700">{item.speaker}:</span>
                    <span className="ml-2 text-gray-800">{item.line}</span>
                  </div>
                )}
              </div>
              ));
            })()}

            {/* 정답지 모드일 때만 한글 번역 표시 */}
            {showAnswerSheet && passage.korean_translation && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-semibold text-green-800 mb-3">📝 지문 해설</div>

                {/* 새로운 데이터 구조 처리: { title, paragraphs } 형식 */}
                {(passage.korean_translation.title || passage.korean_translation.paragraphs) ? (
                  <div>
                    {/* 제목 렌더링 */}
                    {passage.korean_translation.title && (
                      <h4 className="font-bold text-green-900 mb-3">{passage.korean_translation.title}</h4>
                    )}

                    {/* 문단 렌더링 */}
                    {passage.korean_translation.paragraphs && passage.korean_translation.paragraphs.map((paragraph: string, idx: number) => (
                      <div key={idx} className="mb-3">
                        <div className="text-green-800 leading-relaxed">{paragraph}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* 기존 데이터 구조 처리: { content: [...] } 형식 */
                  passage.korean_translation.content?.map((item: any, idx: number) => (
                    <div key={idx} className="mb-2">
                      {item.type === 'title' && (
                        <h4 className="font-bold text-green-900">{item.value}</h4>
                      )}
                      {item.type === 'paragraph' && (
                        <div className="text-green-800 leading-relaxed">{item.value}</div>
                      )}
                      {item.type === 'list' && item.items && (
                        <ul className="list-disc list-inside">
                          {item.items.map((listItem: string, listIdx: number) => (
                            <li key={listIdx} className="text-green-800">{listItem}</li>
                          ))}
                        </ul>
                      )}
                      {item.type === 'key_value' && item.pairs && (
                        <div className="border border-green-300 rounded-lg p-3 bg-green-100">
                          {item.pairs.map((pair: { key: string; value: string }, pairIdx: number) => (
                            <div key={pairIdx} className="flex justify-between py-1">
                              <span className="font-semibold text-green-700">{pair.key}:</span>
                              <span className="text-green-800">{pair.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.speaker && item.line && (
                        <div className="dialogue-line mb-2">
                          <span className="font-semibold text-green-700">{item.speaker}:</span>
                          <span className="ml-2 text-green-800">{item.line}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
};