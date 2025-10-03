package com.codenight.bip.api;

import com.codenight.bip.domain.User;
import com.codenight.bip.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<User> list() { return userService.list(); }

    @GetMapping("/{id}")
    public User get(@PathVariable String id) { return userService.get(id); }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user) {
        User saved = userService.create(user);
        return ResponseEntity.created(URI.create("/users/" + saved.getUserId())).body(saved);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable String id, @RequestBody User body) {
        return userService.update(id, body);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { userService.delete(id); }
}
