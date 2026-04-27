package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.repository.UserRepository

class GetProfileUseCase(private val userRepository: UserRepository) {
    suspend fun execute() = userRepository.getProfile()
}
