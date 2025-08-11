'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Plus, X, Tag } from 'lucide-react';
import Header from '@/components/Header';
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

interface CouponFormData {
  brand: string;
  code: string;
  description: string;
  tags: string[];
  link?: string;
  expiresAt?: string;
}

export default function AddCouponPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState<CouponFormData>({
    brand: '',
    code: '',
    description: '',
    tags: [],
    link: '',
    expiresAt: '',
  });

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/coupons/new');
    return null;
  }

  const handleInputChange = (field: keyof CouponFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    if (!formData.brand.trim()) return 'Brand name is required';
    if (!formData.code.trim()) return 'Coupon code is required';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.description.length < 10) return 'Description must be at least 10 characters';
    if (formData.tags.length === 0) return 'At least one tag is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to submit coupon
      console.log('Submitting coupon:', formData);
      
      // Analytics
      captureEvent(ANALYTICS_EVENTS.COUPON_SUBMITTED, {
        brand: formData.brand,
        hasExpiration: !!formData.expiresAt,
        tagCount: formData.tags.length,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to coupons page
      router.push('/coupons?submitted=true');
    } catch (error) {
      console.error('Failed to submit coupon:', error);
      alert('Failed to submit coupon. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Coupon</h1>
          <p className="text-gray-600">
            Share a coupon code with the community and help others save money!
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Brand/Store Name *
              </label>
              <input
                type="text"
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="e.g., Nike, Amazon, Target"
                className="input-field"
                required
              />
            </div>

            {/* Coupon Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code *
              </label>
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., SAVE20, PRIME10"
                className="input-field font-mono"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the offer, any restrictions, minimum purchase, etc."
                rows={3}
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters. Be specific about the offer and any conditions.
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags *
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag (e.g., electronics, clothing)"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Tag suggestions */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-2">
                  {['electronics', 'clothing', 'food', 'home', 'sports', 'beauty', 'books', 'travel'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(tag)) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag],
                          }));
                        }
                      }}
                      disabled={formData.tags.includes(tag)}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Store Link */}
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                Store Link (Optional)
              </label>
              <input
                type="url"
                id="link"
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                placeholder="https://store.com"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Link to the store where this coupon can be used.
              </p>
            </div>

            {/* Expiration Date */}
            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                id="expiresAt"
                value={formData.expiresAt}
                onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                If the coupon has an expiration date, let others know!
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Submit Coupon</span>
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Guidelines */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Guidelines for submitting coupons:</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Only submit coupons you've personally verified or found from reliable sources</li>
              <li>• Be accurate with the description and any restrictions</li>
              <li>• Include relevant tags to help others find your coupon</li>
              <li>• Don't submit expired or invalid coupon codes</li>
              <li>• Respect the community by providing helpful, accurate information</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 