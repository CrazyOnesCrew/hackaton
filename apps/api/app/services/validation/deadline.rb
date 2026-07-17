module Validation
  class Deadline
    def initialize(seconds:, clock: nil)
      @clock = clock || -> { Process.clock_gettime(Process::CLOCK_MONOTONIC) }
      @expires_at = @clock.call + seconds
    end

    def check!
      raise TimeoutError, "expression validation exceeded its time limit" if @clock.call >= @expires_at
    end
  end
end
