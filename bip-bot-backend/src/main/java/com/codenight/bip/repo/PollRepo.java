package com.codenight.bip.repo;

import com.codenight.bip.domain.Poll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PollRepo extends JpaRepository<Poll, Long> {

    Optional<Poll> findFirstByEvent_EventIdOrderByPollIdAsc(Long eventId);

    Optional<Poll> findByEvent_EventIdAndQuestionAndLockedFalse(Long eventId, String question);
}
