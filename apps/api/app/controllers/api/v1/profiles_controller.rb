module Api
  module V1
    class ProfilesController < ApplicationController
      include Api::V1::Concerns::Authenticatable

      def show
        render json: { data: user_payload(current_user) }, status: :ok
      end

      def update
        if current_user.update(profile_params)
          render json: { data: user_payload(current_user) }, status: :ok
        else
          render_validation_error(current_user)
        end
      end

      private

      def profile_params
        params.permit(:displayName, :email).then do |permitted|
          {
            display_name: permitted[:displayName],
            email: permitted[:email]
          }.compact
        end
      end

      def user_payload(user)
        {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role
        }
      end

      def render_validation_error(user)
        render json: {
          error: {
            code: "validation_error",
            message: "No fue posible actualizar el perfil.",
            details: user.errors.map { |error| { field: error.attribute.to_s, message: error.message } }
          }
        }, status: :unprocessable_content
      end
    end
  end
end
