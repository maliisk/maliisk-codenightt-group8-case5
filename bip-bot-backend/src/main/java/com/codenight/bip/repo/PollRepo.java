package com.codenight.bip.repo;

import com.codenight.bip.domain.Poll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PollRepo extends JpaRepository<Poll, Long> {

    // Etkinliğe ait ilk anket (EventService.summary için)
    Optional<Poll> findFirstByEvent_EventIdOrderByPollIdAsc(Long eventId);

    // “Mekan seçimi” anketini (kilitli olmayan) getir — /mekan komutu için
    Optional<Poll> findByEvent_EventIdAndQuestionAndLockedFalse(Long eventId, String question);
}
