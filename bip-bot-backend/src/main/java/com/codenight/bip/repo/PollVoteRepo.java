package com.codenight.bip.repo;

import com.codenight.bip.domain.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PollVoteRepo extends JpaRepository<PollVote, Long> {
    long countByChoice_ChoiceId(Long choiceId);
    Optional<PollVote> findByPoll_PollIdAndUserId(Long pollId, String userId);
}
