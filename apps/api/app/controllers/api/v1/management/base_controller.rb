module Api
  module V1
    module Management
      class BaseController < ApplicationController
        include Api::V1::Concerns::Authenticatable

        class ValidationFailure < StandardError
          attr_reader :details

          def initialize(details)
            @details = details
            super("Request validation failed")
          end
        end

        before_action :require_content_manager!

        rescue_from ValidationFailure, with: :render_validation_failure

        private

        def render_not_found(resource)
          render json: {
            error: {
              code: "not_found",
              message: "#{resource} not found."
            }
          }, status: :not_found
        end

        def render_validation_failure(error)
          render json: {
            error: {
              code: "validation_failed",
              message: "No fue posible procesar el ejercicio.",
              details: error.details
            }
          }, status: :unprocessable_content
        end

        def fail_validation!(field, message)
          raise ValidationFailure, [ { field:, message: } ]
        end

        def save_record!(record, field_prefix)
          return if record.save

          details = record.errors.map do |error|
            {
              field: [ field_prefix, error.attribute.to_s.camelize(:lower) ].compact.join("."),
              message: error.message
            }
          end
          raise ValidationFailure, details
        end

        def assign_enum!(record, attribute, value, field)
          record.public_send("#{attribute}=", value)
        rescue ArgumentError
          fail_validation!(field, "is invalid")
        end
      end
    end
  end
end
