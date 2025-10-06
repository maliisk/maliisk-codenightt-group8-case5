package com.codenight.bip.repo;

import com.codenight.bip.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EventRepo extends JpaRepository<Event, Long> {

    Optional<Event> findTopByGroupIdOrderByCreatedAtDesc(String groupId);

    @Query("select distinct e.groupId from Event e")
    List<String> findDistinctGroupIds();
}
